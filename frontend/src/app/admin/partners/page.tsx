'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, Building2, MapPin, Eye, EyeOff } from 'lucide-react'
import api from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import PartnerModal from './PartnerModal'

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

interface Stats {
  total: number
  active: number
  cities: number
}

export default function AdminPartnersPage() {
  const toast = useToast()

  const [partners, setPartners] = useState<Partner[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
  const [creating, setCreating] = useState(false)

  const fetchPartners = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get<Partner[]>('/admin/partners/')
      setPartners(data)
    } catch {
      toast.add('Помилка завантаження', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get<Stats>('/admin/partners/stats/')
      setStats(data)
    } catch {}
  }, [])

  useEffect(() => {
    fetchPartners()
    fetchStats()
  }, [])

  const handleDelete = async (partner: Partner) => {
    try {
      await api.delete(`/admin/partners/${partner.id}/`)
      toast.add('Автошколу видалено', 'success')
      fetchPartners()
      fetchStats()
    } catch {
      toast.add('Помилка видалення', 'error')
    }
  }

  const handleToggleActive = async (partner: Partner) => {
    try {
      await api.patch(`/admin/partners/${partner.id}/`, { is_active: !partner.is_active })
      toast.add(partner.is_active ? 'Автошколу приховано' : 'Автошколу активовано', 'success')
      fetchPartners()
      fetchStats()
    } catch {
      toast.add('Помилка оновлення', 'error')
    }
  }

  const handleSaved = () => {
    setEditingPartner(null)
    setCreating(false)
    fetchPartners()
    fetchStats()
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Автошколи-партнери</h1>
          <p className="text-base-content/60 text-sm mt-1">Управління партнерськими автошколами</p>
        </div>
        <button className="btn btn-primary btn-sm gap-2" onClick={() => setCreating(true)}>
          <Plus className="w-4 h-4" />
          Додати автошколу
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card bg-base-100 border border-base-300/60 p-4">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-base-content/50">Всього</p>
          </div>
          <div className="card bg-base-100 border border-base-300/60 p-4">
            <p className="text-2xl font-bold">{stats.active}</p>
            <p className="text-sm text-base-content/50">Активних</p>
          </div>
          <div className="card bg-base-100 border border-base-300/60 p-4">
            <p className="text-2xl font-bold">{stats.cities}</p>
            <p className="text-sm text-base-content/50">Міст</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-md" />
        </div>
      ) : partners.length === 0 ? (
        <div className="card bg-base-100 border border-base-300/60">
          <div className="card-body items-center text-center py-16">
            <Building2 className="w-12 h-12 text-base-content/20 mb-3" />
            <p className="text-base-content/50 mb-1">Немає автошкіл</p>
            <button className="btn btn-primary btn-sm mt-3 gap-2" onClick={() => setCreating(true)}>
              <Plus className="w-4 h-4" />
              Додати першу автошколу
            </button>
          </div>
        </div>
      ) : (
        <div className="card bg-base-100 border border-base-300/60 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Назва</th>
                <th>Місто</th>
                <th>Телефон</th>
                <th>Послуги</th>
                <th className="text-center">Активна</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {partners.map(p => (
                <tr key={p.id} className={`hover ${!p.is_active ? 'opacity-40' : ''}`}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-primary/60" />
                      </div>
                      <div>
                        <p className="font-medium">{p.name}</p>
                        {p.address && <p className="text-xs text-base-content/40">{p.address}</p>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="flex items-center gap-1 text-sm">
                      <MapPin className="w-3.5 h-3.5 text-base-content/40" />
                      {p.city}
                    </span>
                  </td>
                  <td className="text-sm">{p.phone || '-'}</td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {p.services ? p.services.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                        <span key={s} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-base-200 text-base-content/60">{s}</span>
                      )) : '-'}
                    </div>
                  </td>
                  <td className="text-center">
                    <input
                      type="checkbox"
                      className="toggle toggle-primary toggle-sm"
                      checked={p.is_active}
                      onChange={() => handleToggleActive(p)}
                    />
                  </td>
                  <td>
                    <div className="flex gap-1 justify-end">
                      <button className="btn btn-ghost btn-xs btn-square" onClick={() => setEditingPartner(p)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button className="btn btn-ghost btn-xs btn-square text-error" onClick={() => handleDelete(p)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(creating || editingPartner) && (
        <PartnerModal
          partner={editingPartner}
          onClose={() => { setCreating(false); setEditingPartner(null) }}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
