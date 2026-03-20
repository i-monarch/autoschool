'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import api from '@/lib/api'
import { transliterateSlug } from '@/lib/slugify'
import { useToast } from '@/components/ui/Toast'

interface AdminLesson {
  id: number
  title: string
  slug: string
  description: string
  order: number
  duration_seconds: number
  thumbnail: string
  video_url: string
  is_free: boolean
  is_active: boolean
  course: number
}

interface LessonModalProps {
  lessonId: number | null
  courseId: number
  onClose: () => void
  onSaved: () => void
}

export default function LessonModal({ lessonId, courseId, onClose, onSaved }: LessonModalProps) {
  const toast = useToast()
  const isEdit = lessonId !== null

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('')
  const [durationSeconds, setDurationSeconds] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [isFree, setIsFree] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [order, setOrder] = useState(0)
  const [saving, setSaving] = useState(false)
  const [loadingLesson, setLoadingLesson] = useState(false)

  useEffect(() => {
    if (isEdit) {
      setLoadingLesson(true)
      api.get<AdminLesson>(`/admin/courses/lessons/${lessonId}/`)
        .then(({ data }) => {
          setTitle(data.title)
          setSlug(data.slug)
          setDescription(data.description)
          setDurationMinutes(String(Math.floor(data.duration_seconds / 60)))
          setDurationSeconds(String(data.duration_seconds % 60))
          setThumbnail(data.thumbnail)
          setVideoUrl(data.video_url)
          setIsFree(data.is_free)
          setIsActive(data.is_active)
          setOrder(data.order)
        })
        .catch(() => toast.add('Помилка завантаження уроку', 'error'))
        .finally(() => setLoadingLesson(false))
    }
  }, [lessonId])

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!isEdit) {
      setSlug(transliterateSlug(value))
    }
  }

  const handleSave = async () => {
    if (!title.trim() || !slug.trim()) {
      toast.add('Заповніть назву та slug', 'error')
      return
    }

    const totalSeconds = (parseInt(durationMinutes) || 0) * 60 + (parseInt(durationSeconds) || 0)

    setSaving(true)
    try {
      const payload = {
        title,
        slug,
        description,
        duration_seconds: totalSeconds,
        thumbnail,
        video_url: videoUrl,
        is_free: isFree,
        is_active: isActive,
        order,
        course: courseId,
      }

      if (isEdit) {
        await api.put(`/admin/courses/lessons/${lessonId}/`, payload)
        toast.add('Урок оновлено', 'success')
      } else {
        await api.post('/admin/courses/lessons/create/', payload)
        toast.add('Урок створено', 'success')
      }
      onSaved()
    } catch (err: any) {
      const data = err.response?.data
      const msg = data?.slug?.[0] || data?.title?.[0] || data?.video_url?.[0] || 'Помилка збереження'
      toast.add(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loadingLesson) {
    return (
      <div className="modal modal-open">
        <div className="modal-box max-w-lg flex items-center justify-center py-12">
          <span className="loading loading-spinner loading-md" />
        </div>
        <div className="modal-backdrop" onClick={onClose} />
      </div>
    )
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">
            {isEdit ? 'Редагувати урок' : 'Новий урок'}
          </h3>
          <button className="btn btn-ghost btn-sm btn-square" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label"><span className="label-text">Назва</span></label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="Загальні положення ПДР"
            />
          </div>

          <div>
            <label className="label"><span className="label-text">Slug</span></label>
            <input
              type="text"
              className="input input-bordered w-full font-mono text-sm"
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder="zagalni-polozhennya"
            />
          </div>

          <div>
            <label className="label"><span className="label-text">Опис</span></label>
            <textarea
              className="textarea textarea-bordered w-full"
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Короткий опис уроку"
            />
          </div>

          <div>
            <label className="label"><span className="label-text">Тривалість</span></label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="input input-bordered w-24"
                value={durationMinutes}
                onChange={e => setDurationMinutes(e.target.value)}
                placeholder="0"
                min={0}
              />
              <span className="text-sm text-base-content/50">хв</span>
              <input
                type="number"
                className="input input-bordered w-24"
                value={durationSeconds}
                onChange={e => setDurationSeconds(e.target.value)}
                placeholder="0"
                min={0}
                max={59}
              />
              <span className="text-sm text-base-content/50">сек</span>
            </div>
          </div>

          <div>
            <label className="label"><span className="label-text">URL відео</span></label>
            <input
              type="text"
              className="input input-bordered w-full font-mono text-sm"
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              placeholder="https://... або HLS URL"
            />
            <label className="label">
              <span className="label-text-alt text-base-content/50">
                Пряме посилання на відео або HLS (.m3u8)
              </span>
            </label>
          </div>

          <div>
            <label className="label"><span className="label-text">Thumbnail URL</span></label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={thumbnail}
              onChange={e => setThumbnail(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="label"><span className="label-text">Порядок</span></label>
            <input
              type="number"
              className="input input-bordered w-24"
              value={order}
              onChange={e => setOrder(parseInt(e.target.value) || 0)}
              min={0}
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                className="toggle toggle-success toggle-sm"
                checked={isFree}
                onChange={e => setIsFree(e.target.checked)}
              />
              <span className="text-sm">Безкоштовний урок</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
              />
              <span className="text-sm">Активний (видимий)</span>
            </div>
          </div>
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>Скасувати</button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving && <span className="loading loading-spinner loading-xs" />}
            {isEdit ? 'Зберегти' : 'Створити'}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  )
}
