'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import dynamic from 'next/dynamic'
import api from '@/lib/api'
import { transliterateSlug } from '@/lib/slugify'
import { useToast } from '@/components/ui/Toast'

const RichTextEditor = dynamic(() => import('@/components/ui/RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="border border-base-300 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
      <span className="loading loading-spinner loading-sm" />
    </div>
  ),
})

interface ChapterData {
  id: number
  title: string
  slug: string
  number: number
  content: string
  order: number
  section: number
  section_title: string
}

interface ChapterModalProps {
  chapterId: number | null
  sectionId: number
  onClose: () => void
  onSaved: () => void
}

export default function ChapterModal({ chapterId, sectionId, onClose, onSaved }: ChapterModalProps) {
  const toast = useToast()
  const isEdit = chapterId !== null

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [number, setNumber] = useState(0)
  const [content, setContent] = useState('')
  const [order, setOrder] = useState(0)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEdit) {
      setLoading(true)
      api.get<ChapterData>(`/admin/theory/chapters/${chapterId}/`)
        .then(({ data }) => {
          setTitle(data.title)
          setSlug(data.slug)
          setNumber(data.number)
          setContent(data.content)
          setOrder(data.order)
        })
        .catch(() => toast.add('Помилка завантаження глави', 'error'))
        .finally(() => setLoading(false))
    }
  }, [chapterId])

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
      const payload = {
        title, slug, number, content, order,
        section: sectionId,
      }

      if (isEdit) {
        await api.put(`/admin/theory/chapters/${chapterId}/`, payload)
        toast.add('Главу оновлено', 'success')
      } else {
        await api.post('/admin/theory/chapters/create/', payload)
        toast.add('Главу створено', 'success')
      }
      onSaved()
    } catch (err: any) {
      const detail = err.response?.data
      const msg = typeof detail === 'string'
        ? detail
        : detail?.slug?.[0] || detail?.title?.[0] || detail?.non_field_errors?.[0] || 'Помилка збереження'
      toast.add(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-5xl max-h-[90vh]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">
            {isEdit ? 'Редагувати главу' : 'Нова глава'}
          </h3>
          <button className="btn btn-ghost btn-sm btn-square" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label"><span className="label-text">Назва</span></label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={title}
                  onChange={e => handleTitleChange(e.target.value)}
                  placeholder="Назва глави"
                />
              </div>
              <div>
                <label className="label"><span className="label-text">Slug</span></label>
                <input
                  type="text"
                  className="input input-bordered w-full font-mono text-sm"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder="nazva-hlavy"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label"><span className="label-text">Номер</span></label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={number}
                  onChange={e => setNumber(parseInt(e.target.value) || 0)}
                  min={0}
                />
              </div>
              <div>
                <label className="label"><span className="label-text">Порядок</span></label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={order}
                  onChange={e => setOrder(parseInt(e.target.value) || 0)}
                  min={0}
                />
              </div>
            </div>

            <div>
              <label className="label"><span className="label-text">Зміст</span></label>
              <RichTextEditor content={content} onChange={setContent} />
            </div>
          </div>
        )}

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>Скасувати</button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || loading}
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
