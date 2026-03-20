'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import api from '@/lib/api'
import { useToast } from '@/components/ui/Toast'

interface ExamRoute {
  id: number
  center: number
  name: string
  description: string
  map_url: string
  order: number
}

interface RouteModalProps {
  route: ExamRoute | null
  centerId: number
  onClose: () => void
  onSaved: () => void
}

export default function RouteModal({ route, centerId, onClose, onSaved }: RouteModalProps) {
  const toast = useToast()
  const isEdit = !!route

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [mapUrl, setMapUrl] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (route) {
      setName(route.name)
      setDescription(route.description)
      setMapUrl(route.map_url)
    }
  }, [route])

  const handleSave = async () => {
    if (!name.trim()) {
      toast.add('Введіть назву маршруту', 'error')
      return
    }

    setSaving(true)
    try {
      const payload = {
        center: centerId,
        name,
        description,
        map_url: mapUrl,
      }

      if (isEdit) {
        await api.put(`/admin/routes/routes/${route.id}/`, payload)
        toast.add('Маршрут оновлено', 'success')
      } else {
        await api.post('/admin/routes/routes/', payload)
        toast.add('Маршрут створено', 'success')
      }
      onSaved()
    } catch {
      toast.add('Помилка збереження', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">
            {isEdit ? 'Редагувати маршрут' : 'Новий маршрут'}
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
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Маршрут 1"
            />
          </div>

          <div>
            <label className="label"><span className="label-text">Опис</span></label>
            <textarea
              className="textarea textarea-bordered w-full"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Опис маршруту, особливості, поради"
            />
          </div>

          <div>
            <label className="label"><span className="label-text">Посилання на мапу</span></label>
            <input
              type="url"
              className="input input-bordered w-full"
              value={mapUrl}
              onChange={e => setMapUrl(e.target.value)}
              placeholder="https://maps.google.com/..."
            />
            <label className="label">
              <span className="label-text-alt text-base-content/50">
                Посилання на Google Maps з маршрутом
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
