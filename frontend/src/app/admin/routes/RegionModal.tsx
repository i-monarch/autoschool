'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import api from '@/lib/api'
import { useToast } from '@/components/ui/Toast'

interface Region {
  id: number
  name: string
  order: number
}

interface RegionModalProps {
  region: Region | null
  onClose: () => void
  onSaved: () => void
}

export default function RegionModal({ region, onClose, onSaved }: RegionModalProps) {
  const toast = useToast()
  const isEdit = !!region

  const [name, setName] = useState('')
  const [order, setOrder] = useState('0')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (region) {
      setName(region.name)
      setOrder(String(region.order))
    }
  }, [region])

  const handleSave = async () => {
    if (!name.trim()) {
      toast.add('Введіть назву регіону', 'error')
      return
    }

    setSaving(true)
    try {
      const payload = { name, order: Number(order) || 0 }

      if (isEdit) {
        await api.put(`/admin/routes/regions/${region.id}/`, payload)
        toast.add('Регіон оновлено', 'success')
      } else {
        await api.post('/admin/routes/regions/', payload)
        toast.add('Регіон створено', 'success')
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
      <div className="modal-box max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">
            {isEdit ? 'Редагувати регіон' : 'Новий регіон'}
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
              placeholder="Київська та Чернігівська області"
            />
          </div>

          <div>
            <label className="label"><span className="label-text">Порядок</span></label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={order}
              onChange={e => setOrder(e.target.value)}
            />
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
