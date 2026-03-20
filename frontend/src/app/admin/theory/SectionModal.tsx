'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import api from '@/lib/api'
import { useToast } from '@/components/ui/Toast'

interface TheorySection {
  id: number
  title: string
  slug: string
  description: string
  icon: string
  order: number
  chapters_count: number
}

interface SectionModalProps {
  section: TheorySection | null
  onClose: () => void
  onSaved: () => void
}

export default function SectionModal({ section, onClose, onSaved }: SectionModalProps) {
  const toast = useToast()
  const isEdit = !!section

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (section) {
      setTitle(section.title)
      setSlug(section.slug)
      setDescription(section.description)
      setIcon(section.icon)
    }
  }, [section])

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9а-яіїєґ\s-]/gi, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!isEdit) {
      setSlug(generateSlug(value))
    }
  }

  const handleSave = async () => {
    if (!title.trim() || !slug.trim()) {
      toast.add('Заповніть назву та slug', 'error')
      return
    }

    setSaving(true)
    try {
      if (isEdit) {
        await api.put(`/admin/theory/sections/${section.id}/`, {
          title, slug, description, icon,
        })
        toast.add('Розділ оновлено', 'success')
      } else {
        await api.post('/admin/theory/sections/', {
          title, slug, description, icon,
        })
        toast.add('Розділ створено', 'success')
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
            {isEdit ? 'Редагувати розділ' : 'Новий розділ'}
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
              placeholder="Правила дорожнього руху"
            />
          </div>

          <div>
            <label className="label"><span className="label-text">Slug</span></label>
            <input
              type="text"
              className="input input-bordered w-full font-mono text-sm"
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder="pravyla-dorozhnoho-rukhu"
            />
          </div>

          <div>
            <label className="label"><span className="label-text">Опис</span></label>
            <textarea
              className="textarea textarea-bordered w-full"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Короткий опис розділу"
            />
          </div>

          <div>
            <label className="label"><span className="label-text">Іконка (Lucide)</span></label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={icon}
              onChange={e => setIcon(e.target.value)}
              placeholder="BookOpen"
            />
            <label className="label">
              <span className="label-text-alt text-base-content/50">
                Назва іконки з бібліотеки Lucide (наприклад: BookOpen, SignpostBig, Route)
              </span>
            </label>
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
