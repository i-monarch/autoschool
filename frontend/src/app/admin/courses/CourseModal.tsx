'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import api from '@/lib/api'
import { transliterateSlug } from '@/lib/slugify'
import { useToast } from '@/components/ui/Toast'

interface AdminCourse {
  id: number
  title: string
  slug: string
  description: string
  icon: string
  thumbnail: string
  order: number
  is_active: boolean
  lessons_count: number
}

interface CourseModalProps {
  course: AdminCourse | null
  onClose: () => void
  onSaved: () => void
}

export default function CourseModal({ course, onClose, onSaved }: CourseModalProps) {
  const toast = useToast()
  const isEdit = !!course

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (course) {
      setTitle(course.title)
      setSlug(course.slug)
      setDescription(course.description)
      setIcon(course.icon)
      setThumbnail(course.thumbnail)
      setIsActive(course.is_active)
    }
  }, [course])

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

    setSaving(true)
    try {
      const payload = { title, slug, description, icon, thumbnail, is_active: isActive }
      if (isEdit) {
        await api.put(`/admin/courses/courses/${course.id}/`, payload)
        toast.add('Курс оновлено', 'success')
      } else {
        await api.post('/admin/courses/courses/', payload)
        toast.add('Курс створено', 'success')
      }
      onSaved()
    } catch (err: any) {
      const msg = err.response?.data?.slug?.[0] || err.response?.data?.title?.[0] || 'Помилка збереження'
      toast.add(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">
            {isEdit ? 'Редагувати курс' : 'Новий курс'}
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
              placeholder="Правила дорожнього руху України 2026"
            />
          </div>

          <div>
            <label className="label"><span className="label-text">Slug</span></label>
            <input
              type="text"
              className="input input-bordered w-full font-mono text-sm"
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder="pdr-ukraine-2026"
            />
          </div>

          <div>
            <label className="label"><span className="label-text">Опис</span></label>
            <textarea
              className="textarea textarea-bordered w-full"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Короткий опис курсу"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label"><span className="label-text">Іконка (Lucide)</span></label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={icon}
                onChange={e => setIcon(e.target.value)}
                placeholder="BookOpen"
              />
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
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              className="toggle toggle-primary toggle-sm"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
            />
            <span className="text-sm">Активний (видимий для учнів)</span>
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
