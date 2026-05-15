'use client'

import { useCallback, useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileText, Save, Upload } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useToast } from '@/components/ui/Toast'
import {
  createMyInstructorProfile,
  getMyInstructorProfile,
  updateMyInstructorProfile,
} from '@/lib/api/instructors'
import {
  instructorDocumentsSchema,
  type InstructorDocumentsFormData,
} from '@/lib/validations/instructor'
import type { InstructorProfile } from '@/types/instructors'

type FileField = 'certificate_photo' | 'tech_passport'

export default function InstructorDocumentsPage() {
  const addToast = useToast((s) => s.add)
  const [profile, setProfile] = useState<InstructorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [files, setFiles] = useState<Partial<Record<FileField, File>>>({})
  const [certificatePreview, setCertificatePreview] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InstructorDocumentsFormData>({
    resolver: zodResolver(instructorDocumentsSchema),
    defaultValues: { vin_code: '', is_official: false, is_car_equipped: false },
  })

  const loadProfile = useCallback(async () => {
    setLoading(true)
    try {
      const existing = await getMyInstructorProfile()
      const current = existing ?? await createMyInstructorProfile()
      setProfile(current)
      reset({
        vin_code: current.vin_code || '',
        is_official: current.is_official,
        is_car_equipped: current.is_car_equipped,
      })
    } catch {
      addToast('Не вдалося завантажити документи', 'error')
    } finally {
      setLoading(false)
    }
  }, [addToast, reset])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  useEffect(() => {
    return () => {
      if (certificatePreview) URL.revokeObjectURL(certificatePreview)
    }
  }, [certificatePreview])

  const handleFile = (field: FileField, file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      addToast('Файл має бути зображенням', 'error')
      return
    }
    setFiles((current) => ({ ...current, [field]: file }))
    if (field === 'certificate_photo') setCertificatePreview(URL.createObjectURL(file))
  }

  const onSubmit = async (data: InstructorDocumentsFormData) => {
    const hasFiles = Boolean(files.certificate_photo || files.tech_passport)
    const payload = hasFiles ? new FormData() : data

    if (payload instanceof FormData) {
      payload.append('vin_code', data.vin_code)
      payload.append('is_official', String(data.is_official))
      payload.append('is_car_equipped', String(data.is_car_equipped))
      if (files.certificate_photo) payload.append('certificate_photo', files.certificate_photo)
      if (files.tech_passport) payload.append('tech_passport', files.tech_passport)
    }

    try {
      const updated = await updateMyInstructorProfile(payload)
      setProfile(updated)
      setFiles({})
      setCertificatePreview('')
      reset({
        vin_code: updated.vin_code || '',
        is_official: updated.is_official,
        is_car_equipped: updated.is_car_equipped,
      })
      addToast('Збережено', 'success')
    } catch {
      addToast('Не вдалося зберегти документи', 'error')
    }
  }

  const certImage = certificatePreview || profile?.certificate_photo || ''

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
        <h1 className="text-2xl font-bold">Документи</h1>
        <p className="text-base-content/60 text-sm mt-1">Дані для перевірки інструктора та авто.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="card bg-base-100 border border-base-300/60">
            <div className="card-body p-5 space-y-4">
              <div className="form-control">
                <label className="label" htmlFor="vin_code"><span className="label-text font-medium">VIN-код</span></label>
                <input id="vin_code" maxLength={17} className={`input input-bordered uppercase ${errors.vin_code ? 'input-error' : ''}`} placeholder="17 символів" {...register('vin_code')} />
                {errors.vin_code && <span className="text-xs text-error mt-1">{errors.vin_code.message}</span>}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <label className="flex items-center justify-between gap-3 rounded-xl border border-base-300/60 p-4 cursor-pointer">
                  <span>
                    <span className="block font-medium text-sm">Офіційний інструктор</span>
                    <span className="block text-xs text-base-content/50">Позначка у публічному профілі.</span>
                  </span>
                  <input type="checkbox" className="toggle toggle-warning" {...register('is_official')} />
                </label>
                <label className="flex items-center justify-between gap-3 rounded-xl border border-base-300/60 p-4 cursor-pointer">
                  <span>
                    <span className="block font-medium text-sm">Авто обладнане</span>
                    <span className="block text-xs text-base-content/50">Учні бачитимуть цю ознаку.</span>
                  </span>
                  <input type="checkbox" className="toggle toggle-warning" {...register('is_car_equipped')} />
                </label>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300/60">
            <div className="card-body p-5">
              <h2 className="font-semibold mb-1">Техпаспорт</h2>
              <p className="text-xs text-base-content/50 mb-3">Тільки для адміністратора</p>
              <input type="file" accept="image/*" className="file-input file-input-bordered w-full" onChange={(e) => handleFile('tech_passport', e.target.files?.[0])} />
              <p className="text-xs text-base-content/50 mt-2">
                {files.tech_passport?.name || (profile?.tech_passport ? 'Файл вже завантажено' : 'Файл ще не додано')}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300/60 h-max">
          <div className="card-body p-5">
            <h2 className="font-semibold mb-1">Сертифікат</h2>
            <p className="text-xs text-base-content/50 mb-3">Публічний документ</p>
            <div className="aspect-[4/3] rounded-xl bg-base-200 border border-base-300/60 overflow-hidden flex items-center justify-center">
              {certImage ? (
                <img src={certImage} alt="Сертифікат" className="w-full h-full object-cover" />
              ) : (
                <FileText className="w-9 h-9 text-base-content/30" />
              )}
            </div>
            <label className="btn btn-outline btn-warning btn-sm mt-3 gap-2">
              <Upload className="w-4 h-4" />
              Завантажити
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile('certificate_photo', e.target.files?.[0])} />
            </label>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button type="submit" disabled={isSubmitting} className="btn btn-warning w-full sm:w-auto gap-2">
          {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : <Save className="w-4 h-4" />}
          Зберегти
        </button>
      </div>
    </form>
  )
}
