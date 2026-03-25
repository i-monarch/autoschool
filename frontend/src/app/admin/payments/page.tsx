'use client'

import { useEffect, useState, useCallback } from 'react'
import { Save, Plus, X, Check } from 'lucide-react'
import api from '@/lib/api'

interface Tariff {
  id: number
  name: string
  description: string
  price: string
  duration_days: number
  features: string[]
  is_active: boolean
}

export default function AdminPaymentsPage() {
  const [tariff, setTariff] = useState<Tariff | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [featureInput, setFeatureInput] = useState('')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [durationDays, setDurationDays] = useState(30)
  const [features, setFeatures] = useState<string[]>([])
  const [isActive, setIsActive] = useState(true)

  const fetchTariff = useCallback(async () => {
    try {
      const { data } = await api.get<Tariff[]>('/admin/payments/tariffs/')
      if (data.length > 0) {
        const t = data[0]
        setTariff(t)
        setName(t.name)
        setDescription(t.description)
        setPrice(t.price)
        setDurationDays(t.duration_days)
        setFeatures(t.features)
        setIsActive(t.is_active)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTariff()
  }, [fetchTariff])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      const payload = { name, description, price, duration_days: durationDays, features, is_active: isActive }
      if (tariff) {
        const { data } = await api.patch<Tariff>(`/admin/payments/tariffs/${tariff.id}/`, payload)
        setTariff(data)
      } else {
        const { data } = await api.post<Tariff>('/admin/payments/tariffs/', payload)
        setTariff(data)
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  function addFeature() {
    const trimmed = featureInput.trim()
    if (!trimmed || features.includes(trimmed)) return
    setFeatures([...features, trimmed])
    setFeatureInput('')
  }

  function removeFeature(index: number) {
    setFeatures(features.filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-md" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Підписка</h1>
          <p className="text-base-content/60 text-sm mt-1">Налаштування підписки для учнів</p>
        </div>
        <button
          onClick={handleSave}
          className="btn btn-primary btn-sm gap-2"
          disabled={saving || !name || !price}
        >
          {saving ? (
            <span className="loading loading-spinner loading-xs" />
          ) : saved ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saved ? 'Збережено' : 'Зберегти'}
        </button>
      </div>

      <div className="card bg-base-100 border border-base-300/60">
        <div className="card-body space-y-5">
          <div className="form-control">
            <label className="label"><span className="label-text text-sm font-medium">Назва підписки</span></label>
            <input
              type="text"
              className="input input-bordered input-sm max-w-md"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Повний доступ"
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text text-sm font-medium">Опис</span></label>
            <textarea
              className="textarea textarea-bordered textarea-sm max-w-md"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Повний доступ до всіх матеріалів автошколи"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4 max-w-md">
            <div className="form-control">
              <label className="label"><span className="label-text text-sm font-medium">Ціна (грн)</span></label>
              <input
                type="number"
                className="input input-bordered input-sm"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="2500"
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text text-sm font-medium">Тривалість (днів)</span></label>
              <input
                type="number"
                className="input input-bordered input-sm"
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                placeholder="30"
                min="1"
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text text-sm font-medium">Що входить у підписку</span></label>
            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                className="input input-bordered input-sm flex-1"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                placeholder="Додати пункт..."
              />
              <button onClick={addFeature} className="btn btn-sm btn-ghost" type="button">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {features.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-success flex-shrink-0" />
                    <span className="flex-1">{f}</span>
                    <button onClick={() => removeFeature(i)} className="btn btn-ghost btn-xs">
                      <X className="w-3 h-3" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="divider my-0" />

          <label className="label cursor-pointer gap-2 w-fit">
            <input
              type="checkbox"
              className="toggle toggle-sm toggle-success"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <span className="label-text text-sm">Показувати учням</span>
          </label>
        </div>
      </div>
    </div>
  )
}
