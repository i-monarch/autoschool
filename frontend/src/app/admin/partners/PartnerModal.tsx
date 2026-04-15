'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import api from '@/lib/api'
import { transliterateSlug } from '@/lib/slugify'
import { useToast } from '@/components/ui/Toast'

interface Partner {
  id: number
  name: string
  slug: string
  description: string
  city: string
  address: string
  phone: string
  website: string
  email: string
  services: string
  price_from: number | null
  rating: number
  is_active: boolean
  order: number
}

interface PartnerModalProps {
  partner: Partner | null
  onClose: () => void
  onSaved: () => void
}

export default function PartnerModal({ partner, onClose, onSaved }: PartnerModalProps) {
  const toast = useToast()
  const isEdit = !!partner

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [email, setEmail] = useState('')
  const [services, setServices] = useState('')
  const [priceFrom, setPriceFrom] = useState<number | ''>('')
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (partner) {
      setName(partner.name)
      setSlug(partner.slug)
      setDescription(partner.description)
      setCity(partner.city)
      setAddress(partner.address)
      setPhone(partner.phone)
      setWebsite(partner.website)
      setEmail(partner.email)
      setServices(partner.services)
      setPriceFrom(partner.price_from ?? '')
      setIsActive(partner.is_active)
    }
  }, [partner])

  const handleNameChange = (value: string) => {
    setName(value)
    if (!isEdit) setSlug(transliterateSlug(value))
  }

  const handleSave = async () => {
    if (!name.trim() || !city.trim()) {
      toast.add('Заповніть назву та місто', 'error')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name, slug, description, city, address, phone,
        website, email, services, is_active: isActive,
        price_from: priceFrom || null,
        rating: partner?.rating ?? 0,
        order: partner?.order ?? 0,
      }
      if (isEdit) {
        await api.put(`/admin/partners/${partner.id}/`, payload)
        toast.add('Автошколу оновлено', 'success')
      } else {
        await api.post('/admin/partners/', payload)
        toast.add('Автошколу додано', 'success')
      }
      onSaved()
    } catch (err: any) {
      const msg = err.response?.data?.slug?.[0] || err.response?.data?.name?.[0] || 'Помилка збереження'
      toast.add(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg max-h-[90vh]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">
            {isEdit ? 'Редагувати автошколу' : 'Додати автошколу'}
          </h3>
          <button className="btn btn-ghost btn-sm btn-square" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto">
          <div>
            <label className="label"><span className="label-text">Назва</span></label>
            <input type="text" className="input input-bordered w-full" value={name}
              onChange={e => handleNameChange(e.target.value)} placeholder="Автошкола Драйв" />
          </div>

          <div>
            <label className="label"><span className="label-text">Slug</span></label>
            <input type="text" className="input input-bordered w-full font-mono text-sm" value={slug}
              onChange={e => setSlug(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label"><span className="label-text">Місто</span></label>
              <input type="text" className="input input-bordered w-full" value={city}
                onChange={e => setCity(e.target.value)} placeholder="Київ" />
            </div>
            <div>
              <label className="label"><span className="label-text">Адреса</span></label>
              <input type="text" className="input input-bordered w-full" value={address}
                onChange={e => setAddress(e.target.value)} placeholder="вул. Хрещатик, 1" />
            </div>
          </div>

          <div>
            <label className="label"><span className="label-text">Опис</span></label>
            <textarea className="textarea textarea-bordered w-full" rows={2} value={description}
              onChange={e => setDescription(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label"><span className="label-text">Телефон</span></label>
              <input type="tel" className="input input-bordered w-full" value={phone}
                onChange={e => setPhone(e.target.value)} placeholder="+380..." />
            </div>
            <div>
              <label className="label"><span className="label-text">Email</span></label>
              <input type="email" className="input input-bordered w-full" value={email}
                onChange={e => setEmail(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label"><span className="label-text">Сайт</span></label>
            <input type="url" className="input input-bordered w-full" value={website}
              onChange={e => setWebsite(e.target.value)} placeholder="https://..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label"><span className="label-text">Послуги (через кому)</span></label>
              <input type="text" className="input input-bordered w-full" value={services}
                onChange={e => setServices(e.target.value)} placeholder="theory, practice, exam" />
            </div>
            <div>
              <label className="label"><span className="label-text">Ціна від (грн)</span></label>
              <input type="number" className="input input-bordered w-full" value={priceFrom}
                onChange={e => setPriceFrom(e.target.value ? parseInt(e.target.value) : '')} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" className="toggle toggle-primary toggle-sm" checked={isActive}
              onChange={e => setIsActive(e.target.checked)} />
            <span className="text-sm">Активна (видима для учнів)</span>
          </div>
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>Скасувати</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving && <span className="loading loading-spinner loading-xs" />}
            {isEdit ? 'Зберегти' : 'Додати'}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  )
}
