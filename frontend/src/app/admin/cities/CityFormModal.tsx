'use client'

import { type ChangeEvent, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { createCity, updateCity, type AdminCity } from '@/lib/api/cities'
import { transliterateSlug } from '@/lib/slugify'
import { useToast } from '@/components/ui/Toast'

const citySchema = z.object({
  name: z.string().min(2, 'Вкажіть назву міста'),
  slug: z.string().min(2, 'Вкажіть slug').regex(/^[a-z0-9-]+$/, 'Лише латиниця, цифри та дефіс'),
  region: z.string(),
  order: z.coerce.number().int().min(0, 'Порядок не може бути від’ємним'),
  is_active: z.boolean(),
})

type CityFormData = z.infer<typeof citySchema>

interface CityFormModalProps {
  city: AdminCity | null
  open: boolean
  onClose: () => void
  onSaved: () => void
}

export default function CityFormModal({ city, open, onClose, onSaved }: CityFormModalProps) {
  const addToast = useToast((state) => state.add)
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CityFormData>({
    resolver: zodResolver(citySchema),
    defaultValues: {
      name: '',
      slug: '',
      region: '',
      order: 0,
      is_active: true,
    },
  })

  const nameField = register('name')

  useEffect(() => {
    if (open) {
      reset({
        name: city?.name ?? '',
        slug: city?.slug ?? '',
        region: city?.region ?? '',
        order: city?.order ?? 0,
        is_active: city?.is_active ?? true,
      })
    }
  }, [city, open, reset])

  const onSubmit = async (data: CityFormData) => {
    try {
      if (city) {
        await updateCity(city.id, data)
        addToast('Місто оновлено', 'success')
      } else {
        await createCity(data)
        addToast('Місто додано', 'success')
      }
      onSaved()
    } catch {
      addToast('Помилка збереження міста', 'error')
    }
  }

  if (!open) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">{city ? 'Редагувати місто' : 'Додати місто'}</h3>
          <button type="button" className="btn btn-ghost btn-sm btn-square" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="label" htmlFor="city-name">
              <span className="label-text">Назва</span>
            </label>
            <input
              id="city-name"
              type="text"
              className="input input-bordered w-full"
              placeholder="Київ"
              name={nameField.name}
              ref={nameField.ref}
              onBlur={nameField.onBlur}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                nameField.onChange(event)
                setValue('slug', transliterateSlug(event.target.value), {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }}
            />
            {errors.name && <p className="text-error text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label" htmlFor="city-slug">
              <span className="label-text">Slug</span>
            </label>
            <input
              id="city-slug"
              type="text"
              className="input input-bordered w-full font-mono text-sm"
              placeholder="kyiv"
              {...register('slug')}
            />
            {errors.slug && <p className="text-error text-xs mt-1">{errors.slug.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="city-region">
                <span className="label-text">Регіон</span>
              </label>
              <input
                id="city-region"
                type="text"
                className="input input-bordered w-full"
                placeholder="Київська область"
                {...register('region')}
              />
            </div>
            <div>
              <label className="label" htmlFor="city-order">
                <span className="label-text">Порядок</span>
              </label>
              <input
                id="city-order"
                type="number"
                min={0}
                className="input input-bordered w-full"
                {...register('order')}
              />
              {errors.order && <p className="text-error text-xs mt-1">{errors.order.message}</p>}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="toggle toggle-primary toggle-sm" {...register('is_active')} />
            <span className="text-sm">Активне місто</span>
          </label>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={isSubmitting}>
              Скасувати
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting && <span className="loading loading-spinner loading-xs" />}
              {city ? 'Зберегти' : 'Додати'}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  )
}
