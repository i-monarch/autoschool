'use client'

import { useEffect, useState, useCallback } from 'react'
import { Save, Plus, X, Check, CreditCard } from 'lucide-react'
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

  useEffect(() => { fetchTariff() }, [fetchTariff])

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
          <p className="text-base-content/60 text-sm mt-1">Налаштування тарифу для учнів</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="label cursor-pointer gap-2">
            <input
              type="checkbox"
              className="toggle toggle-sm toggle-success"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <span className="label-text text-sm">Видима</span>
          </label>
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
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Settings */}
        <div className="card bg-base-100 border border-base-300/60">
          <div className="card-body p-5 space-y-4">
            <div className="form-control">
              <label className="label py-1"><span className="label-text text-sm font-medium">Назва</span></label>
              <input
                type="text"
                className="input input-bordered input-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Повний доступ"
              />
            </div>

            <div className="form-control">
              <label className="label py-1"><span className="label-text text-sm font-medium">Опис</span></label>
              <textarea
                className="textarea textarea-bordered textarea-sm"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Повний доступ до всіх матеріалів автошколи"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label py-1"><span className="label-text text-sm font-medium">Ціна (грн)</span></label>
                <input
                  type="number"
                  className="input input-bordered input-sm"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="1500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-control">
                <label className="label py-1"><span className="label-text text-sm font-medium">Тривалість (днів)</span></label>
                <input
                  type="number"
                  className="input input-bordered input-sm"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  placeholder="90"
                  min="1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Features */}
        <div className="card bg-base-100 border border-base-300/60">
          <div className="card-body p-5">
            <label className="label py-1"><span className="label-text text-sm font-medium">Що входить у підписку</span></label>
            <div className="flex gap-2">
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
              <ul className="mt-3 space-y-1">
                {features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm py-1 px-2 rounded hover:bg-base-200/50">
                    <Check className="w-4 h-4 text-success flex-shrink-0" />
                    <span className="flex-1">{f}</span>
                    <button onClick={() => removeFeature(i)} className="btn btn-ghost btn-xs opacity-40 hover:opacity-100">
                      <X className="w-3 h-3" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="mt-8">
        <h2 className="text-lg font-bold mb-4">Історія платежів</h2>
        <div className="card bg-base-100 border border-base-300/60">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Учень</th>
                <th>Тип</th>
                <th>Сума</th>
                <th>Статус</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="text-center py-10 text-base-content/40">
                  <CreditCard className="w-8 h-8 mx-auto text-base-content/20 mb-2" />
                  <p className="text-sm">Платежів поки немає</p>
                  <p className="text-xs mt-1">Тут відображатимуться всі оплати після підключення платіжної системи</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
