'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Plus, Pencil, Trash2, MapPin, Navigation, Image as ImageIcon,
  ChevronDown, ArrowLeft, Upload, X, Play, Video,
} from 'lucide-react'
import api from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import CenterModal from './CenterModal'
import RouteModal from './RouteModal'
import RegionModal from './RegionModal'

interface AvailableVideo {
  name: string
  url: string
}

interface RouteImage {
  id: number
  center: number
  image: string | null
  source_url: string
  video_url: string
  order: number
}

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
  region: number | null
  name: string
  city: string
  address: string
  phone: string
  lat: string | null
  lng: string | null
  source_url: string
  order: number
  routes: ExamRoute[]
  images: RouteImage[]
  routes_count: number
  images_count: number
}

interface Region {
  id: number
  name: string
  order: number
  centers: ExamCenter[]
  centers_count: number
}

export default function AdminRoutesPage() {
  const toast = useToast()

  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedRegions, setExpandedRegions] = useState<Set<number>>(new Set())
  const [selectedCenter, setSelectedCenter] = useState<ExamCenter | null>(null)

  const [editingCenter, setEditingCenter] = useState<ExamCenter | null>(null)
  const [creatingCenter, setCreatingCenter] = useState(false)
  const [creatingCenterRegion, setCreatingCenterRegion] = useState<number | null>(null)
  const [editingRoute, setEditingRoute] = useState<ExamRoute | null>(null)
  const [creatingRoute, setCreatingRoute] = useState(false)
  const [editingRegion, setEditingRegion] = useState<Region | null>(null)
  const [creatingRegion, setCreatingRegion] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [availableVideos, setAvailableVideos] = useState<AvailableVideo[]>([])
  const [videoManageMode, setVideoManageMode] = useState(false)

  const fetchRegions = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get<Region[]>('/admin/routes/regions/')
      setRegions(data)
    } catch {
      toast.add('Помилка завантаження', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  const fetchVideos = useCallback(async () => {
    try {
      const { data } = await api.get<AvailableVideo[]>('/admin/routes/available-videos/')
      setAvailableVideos(data)
    } catch {}
  }, [])

  useEffect(() => {
    fetchRegions()
    fetchVideos()
  }, [])

  useEffect(() => {
    if (selectedCenter) {
      for (const r of regions) {
        const updated = r.centers.find(c => c.id === selectedCenter.id)
        if (updated) {
          setSelectedCenter(updated)
          return
        }
      }
    }
  }, [regions])

  const toggleRegion = (id: number) => {
    setExpandedRegions(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleDeleteRegion = async (region: Region) => {
    if (!confirm(`Видалити регіон "${region.name}" та всі його центри?`)) return
    try {
      await api.delete(`/admin/routes/regions/${region.id}/`)
      toast.add('Регіон видалено', 'success')
      fetchRegions()
    } catch {
      toast.add('Помилка видалення', 'error')
    }
  }

  const handleDeleteCenter = async (center: ExamCenter) => {
    if (!confirm(`Видалити центр "${center.name}"?`)) return
    try {
      await api.delete(`/admin/routes/centers/${center.id}/`)
      toast.add('Центр видалено', 'success')
      if (selectedCenter?.id === center.id) setSelectedCenter(null)
      fetchRegions()
    } catch {
      toast.add('Помилка видалення', 'error')
    }
  }

  const handleDeleteRoute = async (route: ExamRoute) => {
    if (!confirm(`Видалити маршрут "${route.name}"?`)) return
    try {
      await api.delete(`/admin/routes/routes/${route.id}/`)
      toast.add('Маршрут видалено', 'success')
      fetchRegions()
    } catch {
      toast.add('Помилка видалення', 'error')
    }
  }

  const handleDeleteImage = async (image: RouteImage) => {
    if (!confirm('Видалити зображення?')) return
    try {
      await api.delete(`/admin/routes/images/${image.id}/`)
      toast.add('Зображення видалено', 'success')
      fetchRegions()
    } catch {
      toast.add('Помилка видалення', 'error')
    }
  }

  const handleUploadImages = async (files: FileList) => {
    if (!selectedCenter) return
    setUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData()
        formData.append('center', String(selectedCenter.id))
        formData.append('image', files[i])
        formData.append('order', String(selectedCenter.images.length + i))
        await api.post('/admin/routes/images/', formData)
      }
      toast.add(`Завантажено ${files.length} зображень`, 'success')
      fetchRegions()
    } catch {
      toast.add('Помилка завантаження', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleSetVideo = async (imageId: number, videoUrl: string) => {
    try {
      await api.patch(`/admin/routes/images/${imageId}/`, { video_url: videoUrl })
      toast.add('Відео оновлено', 'success')
      fetchRegions()
    } catch {
      toast.add('Помилка оновлення', 'error')
    }
  }

  const mediaBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000'
  const getImageUrl = (img: RouteImage) => {
    if (img.image) {
      if (img.image.startsWith('http')) return img.image
      return `${mediaBase}${img.image.startsWith('/') ? '' : '/'}${img.image}`
    }
    if (img.source_url) return img.source_url
    return ''
  }

  const totalCenters = regions.reduce((sum, r) => sum + r.centers.length, 0)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Маршрути</h1>
          <p className="text-base-content/60 text-sm mt-1">
            {regions.length} регіонів, {totalCenters} центрів
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-sm btn-outline gap-2"
            onClick={() => setCreatingRegion(true)}
          >
            <Plus className="w-4 h-4" />
            Регіон
          </button>
          <button
            className="btn btn-sm btn-primary gap-2"
            onClick={() => setCreatingCenter(true)}
          >
            <Plus className="w-4 h-4" />
            Центр
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar: regions and centers */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="card bg-base-100 border border-base-300/60 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
            <div className="card-body p-3">
              {loading ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-sm" />
                </div>
              ) : regions.length === 0 ? (
                <p className="text-sm text-base-content/50 text-center py-4">
                  Немає регіонів
                </p>
              ) : (
                <div className="space-y-1">
                  {regions.map(region => (
                    <div key={region.id}>
                      <div
                        className="group flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-base-200 cursor-pointer"
                        onClick={() => toggleRegion(region.id)}
                      >
                        <ChevronDown
                          className={`w-4 h-4 flex-shrink-0 text-base-content/40 transition-transform ${
                            expandedRegions.has(region.id) ? '' : '-rotate-90'
                          }`}
                        />
                        <span className="text-sm font-semibold flex-1 truncate">{region.name}</span>
                        <span className="text-xs text-base-content/40">{region.centers.length}</span>
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="btn btn-ghost btn-xs btn-square"
                            onClick={e => { e.stopPropagation(); setEditingRegion(region) }}
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            className="btn btn-ghost btn-xs btn-square text-error"
                            onClick={e => { e.stopPropagation(); handleDeleteRegion(region) }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {expandedRegions.has(region.id) && (
                        <div className="ml-4 space-y-0.5 mb-1">
                          {region.centers.map(center => (
                            <div
                              key={center.id}
                              className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm cursor-pointer ${
                                selectedCenter?.id === center.id
                                  ? 'bg-primary/10 text-primary font-medium'
                                  : 'hover:bg-base-200'
                              }`}
                              onClick={() => setSelectedCenter(center)}
                            >
                              <MapPin className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
                              <span className="flex-1 truncate text-xs">{center.name}</span>
                              <div className="flex items-center gap-1">
                                {center.images_count > 0 && (
                                  <span className="text-[10px] text-base-content/40">{center.images_count} img</span>
                                )}
                                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    className="btn btn-ghost btn-xs btn-square"
                                    onClick={e => { e.stopPropagation(); setEditingCenter(center) }}
                                  >
                                    <Pencil className="w-2.5 h-2.5" />
                                  </button>
                                  <button
                                    className="btn btn-ghost btn-xs btn-square text-error"
                                    onClick={e => { e.stopPropagation(); handleDeleteCenter(center) }}
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                          <button
                            className="btn btn-ghost btn-xs gap-1 ml-2 text-base-content/50"
                            onClick={() => { setCreatingCenterRegion(region.id); setCreatingCenter(true) }}
                          >
                            <Plus className="w-3 h-3" />
                            Додати центр
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center detail */}
        <div className="flex-1 min-w-0">
          {!selectedCenter ? (
            <div className="card bg-base-100 border border-base-300/60">
              <div className="card-body items-center text-center py-16">
                <Navigation className="w-12 h-12 text-base-content/20 mb-4" />
                <p className="text-base-content/50">
                  Оберіть центр зліва для перегляду
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
                      {selectedCenter.city}{selectedCenter.address ? `, ${selectedCenter.address}` : ''}
                    </p>
                  </div>
                </div>
                <button
                  className="btn btn-sm btn-primary gap-2"
                  onClick={() => setCreatingRoute(true)}
                >
                  <Plus className="w-4 h-4" />
                  Маршрут
                </button>
              </div>

              {/* Images section */}
              <div className="card bg-base-100 border border-base-300/60 mb-4">
                <div className="card-body p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Маршрути
                      <span className="badge badge-sm">{selectedCenter.images.length}</span>
                    </h3>
                    <div className="flex gap-2">
                      <button
                        className={`btn btn-sm gap-2 ${videoManageMode ? 'btn-secondary' : 'btn-outline'}`}
                        onClick={() => setVideoManageMode(!videoManageMode)}
                      >
                        <Video className="w-4 h-4" />
                        {videoManageMode ? 'Готово' : 'Відео'}
                      </button>
                      <label className={`btn btn-sm btn-outline gap-2 ${uploading ? 'loading' : ''}`}>
                        {!uploading && <Upload className="w-4 h-4" />}
                        Завантажити
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={e => e.target.files && handleUploadImages(e.target.files)}
                          disabled={uploading}
                        />
                      </label>
                    </div>
                  </div>

                  {selectedCenter.images.length === 0 ? (
                    <p className="text-sm text-base-content/40 text-center py-4">
                      Немає зображень
                    </p>
                  ) : videoManageMode ? (
                    <div className="space-y-2">
                      {selectedCenter.images.map((img, idx) => (
                        <div key={img.id} className="flex items-center gap-3 p-2 rounded-lg bg-base-200/50">
                          <div className="w-16 h-12 rounded overflow-hidden flex-shrink-0">
                            <img
                              src={getImageUrl(img)}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-sm font-medium w-24 flex-shrink-0">Маршрут {idx + 1}</span>
                          <select
                            className="select select-sm select-bordered flex-1"
                            value={img.video_url || ''}
                            onChange={e => handleSetVideo(img.id, e.target.value)}
                          >
                            <option value="">-- Без відео --</option>
                            {availableVideos.map(v => (
                              <option key={v.url} value={v.url}>{v.name}</option>
                            ))}
                          </select>
                          {img.video_url && (
                            <div className="flex items-center gap-1 text-xs text-secondary flex-shrink-0">
                              <Play className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {selectedCenter.images.map((img, idx) => (
                        <div key={img.id} className="relative group rounded-lg overflow-hidden border border-base-300/40">
                          <div className="aspect-[4/3]">
                            <img
                              src={getImageUrl(img)}
                              alt=""
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-white text-xs font-medium">Маршрут {idx + 1}</span>
                              {img.video_url && (
                                <div className="flex items-center gap-0.5 bg-secondary/90 text-secondary-content rounded-full px-1.5 py-0.5 text-[10px]">
                                  <Play className="w-2.5 h-2.5" />
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            className="absolute top-1 right-1 btn btn-circle btn-xs bg-error/80 border-none text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteImage(img)}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Routes table */}
              <div className="card bg-base-100 border border-base-300/60 overflow-hidden">
                <div className="card-body p-4 pb-0">
                  <h3 className="font-semibold flex items-center gap-2 mb-2">
                    <Navigation className="w-4 h-4" />
                    Маршрути
                    <span className="badge badge-sm">{selectedCenter.routes.length}</span>
                  </h3>
                </div>
                {selectedCenter.routes.length === 0 ? (
                  <div className="text-center py-8 text-base-content/50 text-sm">
                    Немає маршрутів
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
                            {route.description || '--'}
                          </td>
                          <td>
                            <div className="flex gap-1 justify-end">
                              <button
                                className="btn btn-ghost btn-xs btn-square"
                                onClick={() => setEditingRoute(route)}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                className="btn btn-ghost btn-xs btn-square text-error"
                                onClick={() => handleDeleteRoute(route)}
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

      {(creatingRegion || editingRegion) && (
        <RegionModal
          region={editingRegion}
          onClose={() => { setEditingRegion(null); setCreatingRegion(false) }}
          onSaved={() => { setEditingRegion(null); setCreatingRegion(false); fetchRegions() }}
        />
      )}

      {(creatingCenter || editingCenter) && (
        <CenterModal
          center={editingCenter}
          regions={regions}
          defaultRegionId={creatingCenterRegion}
          onClose={() => { setEditingCenter(null); setCreatingCenter(false); setCreatingCenterRegion(null) }}
          onSaved={() => { setEditingCenter(null); setCreatingCenter(false); setCreatingCenterRegion(null); fetchRegions() }}
        />
      )}

      {(creatingRoute || editingRoute) && selectedCenter && (
        <RouteModal
          route={editingRoute}
          centerId={selectedCenter.id}
          onClose={() => { setEditingRoute(null); setCreatingRoute(false) }}
          onSaved={() => { setEditingRoute(null); setCreatingRoute(false); fetchRegions() }}
        />
      )}
    </div>
  )
}
