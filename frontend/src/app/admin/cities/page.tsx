'use client'

import { useCallback, useEffect, useState } from 'react'
import { MapPin, Pencil, Plus, Trash2, X } from 'lucide-react'
import {
  deleteCity as removeCity,
  getAdminCities,
  updateCity,
  type AdminCity,
} from '@/lib/api/cities'
import { useToast } from '@/components/ui/Toast'
import CityFormModal from './CityFormModal'

interface DeleteCityModalProps {
  city: AdminCity | null
  saving: boolean
  onClose: () => void
  onConfirm: () => void
}

function DeleteCityModal({ city, saving, onClose, onConfirm }: DeleteCityModalProps) {
  if (!city) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Видалити місто</h3>
          <button type="button" className="btn btn-ghost btn-sm btn-square" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
          <p className="text-sm text-base-content/70">
            Місто {city.name} буде видалено зі списку. Цю дію неможливо скасувати.
          </p>
        </div>
        <div className="modal-action">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Скасувати
          </button>
          <button type="button" className="btn btn-error" onClick={onConfirm} disabled={saving}>
            {saving && <span className="loading loading-spinner loading-xs" />}
            Видалити
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  )
}

export default function AdminCitiesPage() {
  const addToast = useToast((state) => state.add)
  const [cities, setCities] = useState<AdminCity[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AdminCity | null>(null)
  const [deleting, setDeleting] = useState<AdminCity | null>(null)
  const [actionId, setActionId] = useState<number | null>(null)

  const loadCities = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAdminCities()
      setCities(data)
    } catch {
      addToast('Помилка завантаження міст', 'error')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    loadCities()
  }, [loadCities])

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (city: AdminCity) => {
    setEditing(city)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditing(null)
  }

  const handleSaved = () => {
    closeForm()
    loadCities()
  }

  const toggleActive = async (city: AdminCity) => {
    setActionId(city.id)
    try {
      await updateCity(city.id, { is_active: !city.is_active })
      addToast(city.is_active ? 'Місто приховано' : 'Місто активовано', 'success')
      await loadCities()
    } catch {
      addToast('Помилка оновлення міста', 'error')
    } finally {
      setActionId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    setActionId(deleting.id)
    try {
      await removeCity(deleting.id)
      addToast('Місто видалено', 'success')
      setDeleting(null)
      await loadCities()
    } catch {
      addToast('Помилка видалення міста', 'error')
    } finally {
      setActionId(null)
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Міста</h1>
          <p className="text-sm text-base-content/60 mt-1">
            Керування містами для фільтрів, профілів та інструкторів
          </p>
        </div>
        <button type="button" className="btn btn-primary btn-sm gap-2" onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Додати місто
        </button>
      </div>

      <div className="card bg-base-100 border border-base-300/60 overflow-x-auto">
        <table className="table table-sm [&_td]:py-3">
          <thead>
            <tr>
              <th>Назва</th>
              <th>Регіон</th>
              <th className="text-center">Порядок</th>
              <th className="text-center">Активне</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-12">
                  <span className="loading loading-spinner loading-md" />
                </td>
              </tr>
            ) : cities.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-base-content/50">
                  <MapPin className="w-8 h-8 mx-auto text-base-content/20 mb-2" />
                  Міста ще не додані
                </td>
              </tr>
            ) : (
              cities.map((city) => (
                <tr key={city.id} className={`hover ${!city.is_active ? 'opacity-50' : ''}`}>
                  <td>
                    <div>
                      <p className="font-medium">{city.name}</p>
                      <p className="text-xs text-base-content/40 font-mono">{city.slug}</p>
                    </div>
                  </td>
                  <td className="text-sm text-base-content/70">{city.region || 'Не вказано'}</td>
                  <td className="text-center text-sm">{city.order}</td>
                  <td className="text-center">
                    <input
                      type="checkbox"
                      className="toggle toggle-primary toggle-sm"
                      checked={city.is_active}
                      disabled={actionId === city.id}
                      onChange={() => toggleActive(city)}
                    />
                  </td>
                  <td>
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs btn-square"
                        onClick={() => openEdit(city)}
                        aria-label="Редагувати"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs btn-square text-error"
                        onClick={() => setDeleting(city)}
                        aria-label="Видалити"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CityFormModal
        city={editing}
        open={formOpen}
        onClose={closeForm}
        onSaved={handleSaved}
      />
      <DeleteCityModal
        city={deleting}
        saving={actionId === deleting?.id}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
