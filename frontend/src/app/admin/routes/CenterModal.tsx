'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import api from '@/lib/api'
import { useToast } from '@/components/ui/Toast'

interface ExamCenter {
  id: number
  name: string
  city: string
  address: string
  phone: string
  lat: string | null
  lng: string | null
  order: number
}

interface CenterModalProps {
  center: ExamCenter | null
  onClose: () => void
  onSaved: () => void
}

export default function CenterModal({ center, onClose, onSaved }: CenterModalProps) {
  const toast = useToast()
  const isEdit = !!center

  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (center) {
      setName(center.name)
      setCity(center.city)
      setAddress(center.address)
      setPhone(center.phone)
      setLat(center.lat || '')
      setLng(center.lng || '')
    }
  }, [center])

  const handleSave = async () => {
    if (!name.trim() || !city.trim() || !address.trim()) {
      toast.add('Заповніть назву, місто та адресу', 'error')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name, city, address, phone,
        lat: lat ? lat : null,
        lng: lng ? lng : null,
      }

      if (isEdit) {
        await api.put(`/admin/routes/centers/${center.id}/`, payload)
        toast.add('Центр оновлено', 'success')
      } else {
        await api.post('/admin/routes/centers/', payload)
        toast.add('Центр створено', 'success')
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
            {isEdit ? 'Редагувати центр' : 'Новий центр'}
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
              placeholder="ТСЦ МВС 1234"
            />
          </div>

          <div>
            <label className="label"><span className="label-text">Місто</span></label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="Київ"
            />
          </div>

          <div>
            <label className="label"><span className="label-text">Адреса</span></label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="вул. Прикладна, 1"
            />
          </div>

          <div>
            <label className="label"><span className="label-text">Телефон</span></label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+380 44 123 45 67"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label"><span className="label-text">Широта</span></label>
              <input
                type="text"
                className="input input-bordered w-full font-mono text-sm"
                value={lat}
                onChange={e => setLat(e.target.value)}
                placeholder="50.450001"
              />
            </div>
            <div>
              <label className="label"><span className="label-text">Довгота</span></label>
              <input
                type="text"
                className="input input-bordered w-full font-mono text-sm"
                value={lng}
                onChange={e => setLng(e.target.value)}
                placeholder="30.523333"
              />
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
