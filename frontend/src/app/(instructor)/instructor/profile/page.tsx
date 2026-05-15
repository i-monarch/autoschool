'use client'

import { useCallback, useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useToast } from '@/components/ui/Toast'
import {
  createMyInstructorProfile,
  getMyInstructorProfile,
  updateMyInstructorProfile,
} from '@/lib/api/instructors'
import {
  instructorProfileSchema,
  type InstructorProfileFormData,
} from '@/lib/validations/instructor'
import type { InstructorProfile } from '@/types/instructors'

type ImageField = 'photo' | 'car_photo'

const imageLabels: Record<ImageField, string> = {
  photo: 'Фото інструктора',
  car_photo: 'Фото авто',
}

export default function InstructorProfilePage() {
  const addToast = useToast((s) => s.add)
  const [profile, setProfile] = useState<InstructorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [files, setFiles] = useState<Partial<Record<ImageField, File>>>({})
  const [previews, setPreviews] = useState<Partial<Record<ImageField, string>>>({})

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InstructorProfileFormData>({
    resolver: zodResolver(instructorProfileSchema),
    defaultValues: { car_model: '', description: '', price_per_hour: null },
  })

  const loadProfile = useCallback(async () => {
    setLoading(true)
    try {
      const existing = await getMyInstructorProfile()
      const current = existing ?? await createMyInstructorProfile()
      setProfile(current)
      reset({
        car_model: current.car_model || '',
        description: current.description || '',
        price_per_hour: current.price_per_hour,
      })
    } catch {
      addToast('Не вдалося завантажити профіль', 'error')
    } finally {
      setLoading(false)
    }
  }, [addToast, reset])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previews])

  const handleFile = (field: ImageField, file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      addToast('Файл має бути зображенням', 'error')
      return
    }
    const nextPreview = URL.createObjectURL(file)
    setFiles((current) => ({ ...current, [field]: file }))
    setPreviews((current) => ({ ...current, [field]: nextPreview }))
  }

  const imageSrc = (field: ImageField) => previews[field] || profile?.[field] || ''

  const onSubmit = async (data: InstructorProfileFormData) => {
    const hasFiles = Boolean(files.photo || files.car_photo)
    const payload = hasFiles ? new FormData() : data

    if (payload instanceof FormData) {
      payload.append('car_model', data.car_model)
      payload.append('description', data.description)
      payload.append('price_per_hour', data.price_per_hour === null ? '' : String(data.price_per_hour))
      if (files.photo) payload.append('photo', files.photo)
      if (files.car_photo) payload.append('car_photo', files.car_photo)
    }

    try {
      const updated = await updateMyInstructorProfile(payload)
      setProfile(updated)
      setFiles({})
      setPreviews({})
      reset({
        car_model: updated.car_model || '',
        description: updated.description || '',
        price_per_hour: updated.price_per_hour,
      })
      addToast('Збережено', 'success')
    } catch {
      addToast('Не вдалося зберегти профіль', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-md text-warning" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Профіль</h1>
        <p className="text-base-content/60 text-sm mt-1">Дані, які бачать учні у каталозі інструкторів.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="card bg-base-100 border border-base-300/60">
            <div className="card-body p-5 space-y-4">
              <div className="form-control">
                <label className="label" htmlFor="car_model"><span className="label-text font-medium">Модель авто</span></label>
                <input id="car_model" className={`input input-bordered ${errors.car_model ? 'input-error' : ''}`} placeholder="Toyota Corolla" {...register('car_model')} />
                {errors.car_model && <span className="text-xs text-error mt-1">{errors.car_model.message}</span>}
              </div>

              <div className="form-control">
                <label className="label" htmlFor="description"><span className="label-text font-medium">Опис</span></label>
                <textarea id="description" rows={6} className={`textarea textarea-bordered text-base ${errors.description ? 'textarea-error' : ''}`} placeholder="Коротко розкажіть про досвід, стиль навчання та авто." {...register('description')} />
                {errors.description && <span className="text-xs text-error mt-1">{errors.description.message}</span>}
              </div>

              <div className="form-control">
                <label className="label" htmlFor="price_per_hour"><span className="label-text font-medium">Ціна за годину, грн</span></label>
                <input
                  id="price_per_hour"
                  type="number"
                  min="1"
                  step="1"
                  className={`input input-bordered ${errors.price_per_hour ? 'input-error' : ''}`}
                  placeholder="800"
                  {...register('price_per_hour')}
                />
                {errors.price_per_hour && <span className="text-xs text-error mt-1">{errors.price_per_hour.message}</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {(['photo', 'car_photo'] as const).map((field) => (
            <div key={field} className="card bg-base-100 border border-base-300/60">
              <div className="card-body p-5">
                <h2 className="font-semibold text-sm mb-3">{imageLabels[field]}</h2>
                <div className="aspect-square rounded-xl bg-base-200 border border-base-300/60 overflow-hidden flex items-center justify-center">
                  {imageSrc(field) ? (
                    <img src={imageSrc(field)} alt={imageLabels[field]} className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-base-content/30" />
                  )}
                </div>
                <input type="file" accept="image/*" className="file-input file-input-bordered file-input-sm w-full mt-3" onChange={(e) => handleFile(field, e.target.files?.[0])} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sticky bottom-20 z-20 mt-6 lg:static">
        <div className="bg-base-100/90 backdrop-blur border border-base-300/60 rounded-xl p-3 lg:bg-transparent lg:border-0 lg:p-0">
          <button type="submit" disabled={isSubmitting} className="btn btn-warning w-full lg:w-auto gap-2">
            {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : <Save className="w-4 h-4" />}
            Зберегти
          </button>
        </div>
      </div>
    </form>
  )
}
