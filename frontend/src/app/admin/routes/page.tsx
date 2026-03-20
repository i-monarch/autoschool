'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Plus, Pencil, Trash2, MapPin, Navigation,
  ChevronRight, ArrowLeft,
} from 'lucide-react'
import api from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import CenterModal from './CenterModal'
import RouteModal from './RouteModal'

interface ExamRoute {
  id: number
  center: number
  name: string
  description: string
  map_url: string
  order: number
}

interface ExamCenter {
  id: number
  name: string
  city: string
  address: string
  phone: string
  lat: string | null
  lng: string | null
  order: number
  routes: ExamRoute[]
  routes_count: number
}

export default function AdminRoutesPage() {
  const toast = useToast()

  const [centers, setCenters] = useState<ExamCenter[]>([])
  const [selectedCenter, setSelectedCenter] = useState<ExamCenter | null>(null)
  const [loading, setLoading] = useState(true)

  const [editingCenter, setEditingCenter] = useState<ExamCenter | null>(null)
  const [creatingCenter, setCreatingCenter] = useState(false)
  const [editingRoute, setEditingRoute] = useState<ExamRoute | null>(null)
  const [creatingRoute, setCreatingRoute] = useState(false)

  const fetchCenters = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get<ExamCenter[]>('/admin/routes/centers/')
      setCenters(data)
    } catch {
      toast.add('Помилка завантаження центрів', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchCenters()
  }, [])

  useEffect(() => {
    if (selectedCenter) {
      const updated = centers.find(c => c.id === selectedCenter.id)
      if (updated) setSelectedCenter(updated)
    }
  }, [centers])

  const handleDeleteCenter = async (center: ExamCenter) => {
    if (!confirm(`Видалити центр "${center.name}" та всі його маршрути?`)) return
    try {
      await api.delete(`/admin/routes/centers/${center.id}/`)
      toast.add('Центр видалено', 'success')
      if (selectedCenter?.id === center.id) setSelectedCenter(null)
      fetchCenters()
    } catch {
      toast.add('Помилка видалення', 'error')
    }
  }

  const handleDeleteRoute = async (route: ExamRoute) => {
    if (!confirm(`Видалити маршрут "${route.name}"?`)) return
    try {
      await api.delete(`/admin/routes/routes/${route.id}/`)
      toast.add('Маршрут видалено', 'success')
      fetchCenters()
    } catch {
      toast.add('Помилка видалення', 'error')
    }
  }

  const handleCenterSaved = () => {
    setEditingCenter(null)
    setCreatingCenter(false)
    fetchCenters()
  }

  const handleRouteSaved = () => {
    setEditingRoute(null)
    setCreatingRoute(false)
    fetchCenters()
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Маршрути</h1>
          <p className="text-base-content/60 text-sm mt-1">
            {centers.length} {centers.length === 1 ? 'центр' : centers.length < 5 ? 'центри' : 'центрів'}
          </p>
        </div>
        <button
          className="btn btn-sm btn-primary gap-2"
          onClick={() => setCreatingCenter(true)}
        >
          <Plus className="w-4 h-4" />
          Додати центр
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Centers sidebar */}
        <div className="lg:w-72 flex-shrink-0">
          <div className="card bg-base-100 border border-base-300/60 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
            <div className="card-body p-3">
              <h3 className="font-semibold text-sm px-1 mb-2">Центри</h3>
              {loading ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-sm" />
                </div>
              ) : centers.length === 0 ? (
                <p className="text-sm text-base-content/50 text-center py-4">
                  Немає центрів
                </p>
              ) : (
                centers.map(center => (
                  <div
                    key={center.id}
                    className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                      selectedCenter?.id === center.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-base-200'
                    }`}
                    onClick={() => setSelectedCenter(center)}
                  >
                    <MapPin className="w-4 h-4 flex-shrink-0 opacity-50" />
                    <div className="flex-1 min-w-0">
                      <span className="truncate block">{center.name}</span>
                      <span className="text-xs opacity-50">{center.city}</span>
                    </div>
                    <span className="text-xs opacity-50 group-hover:hidden">{center.routes_count}</span>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="btn btn-ghost btn-xs btn-square"
                        onClick={e => { e.stopPropagation(); setEditingCenter(center) }}
                        title="Редагувати"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        className="btn btn-ghost btn-xs btn-square text-error"
                        onClick={e => { e.stopPropagation(); handleDeleteCenter(center) }}
                        title="Видалити"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Routes area */}
        <div className="flex-1 min-w-0">
          {!selectedCenter ? (
            <div className="card bg-base-100 border border-base-300/60">
              <div className="card-body items-center text-center py-16">
                <Navigation className="w-12 h-12 text-base-content/20 mb-4" />
                <p className="text-base-content/50">
                  Оберіть центр зліва для перегляду та редагування маршрутів
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button
                    className="btn btn-ghost btn-sm btn-square lg:hidden"
                    onClick={() => setSelectedCenter(null)}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h2 className="text-lg font-bold">{selectedCenter.name}</h2>
                    <p className="text-sm text-base-content/60">
                      {selectedCenter.city}, {selectedCenter.address}
                    </p>
                  </div>
                </div>
                <button
                  className="btn btn-sm btn-primary gap-2"
                  onClick={() => setCreatingRoute(true)}
                >
                  <Plus className="w-4 h-4" />
                  Додати маршрут
                </button>
              </div>

              <div className="card bg-base-100 border border-base-300/60 overflow-hidden">
                {selectedCenter.routes.length === 0 ? (
                  <div className="text-center py-12 text-base-content/50">
                    <p>Немає маршрутів у цьому центрі</p>
                    <button
                      className="btn btn-sm btn-primary mt-4 gap-2"
                      onClick={() => setCreatingRoute(true)}
                    >
                      <Plus className="w-4 h-4" />
                      Створити перший маршрут
                    </button>
                  </div>
                ) : (
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Назва</th>
                        <th>Опис</th>
                        <th className="w-20" />
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCenter.routes.map(route => (
                        <tr key={route.id} className="hover">
                          <td className="font-medium">{route.name}</td>
                          <td className="text-base-content/60 text-sm truncate max-w-xs">
                            {route.description || '—'}
                          </td>
                          <td>
                            <div className="flex gap-1 justify-end">
                              <button
                                className="btn btn-ghost btn-xs btn-square"
                                onClick={() => setEditingRoute(route)}
                                title="Редагувати"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                className="btn btn-ghost btn-xs btn-square text-error"
                                onClick={() => handleDeleteRoute(route)}
                                title="Видалити"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {(creatingCenter || editingCenter) && (
        <CenterModal
          center={editingCenter}
          onClose={() => { setEditingCenter(null); setCreatingCenter(false) }}
          onSaved={handleCenterSaved}
        />
      )}

      {(creatingRoute || editingRoute) && selectedCenter && (
        <RouteModal
          route={editingRoute}
          centerId={selectedCenter.id}
          onClose={() => { setEditingRoute(null); setCreatingRoute(false) }}
          onSaved={handleRouteSaved}
        />
      )}
    </div>
  )
}
