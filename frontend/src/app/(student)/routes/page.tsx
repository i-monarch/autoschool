'use client'

import { useEffect, useState } from 'react'
import { MapPin, ChevronDown, Navigation, ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '@/lib/api'

interface RouteImage {
  id: number
  image: string | null
  source_url: string
  order: number
}

interface ExamRoute {
  id: number
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
  images: RouteImage[]
  routes: ExamRoute[]
}

interface Region {
  id: number
  name: string
  order: number
  centers: ExamCenter[]
}

function ImageGallery({ images, centerName }: { images: RouteImage[], centerName: string }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  if (images.length === 0) return null

  const mediaBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000'

  const getImageUrl = (img: RouteImage) => {
    if (img.image) {
      if (img.image.startsWith('http')) return img.image
      return `${mediaBase}${img.image.startsWith('/') ? '' : '/'}${img.image}`
    }
    if (img.source_url) return img.source_url
    return ''
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-3">
        {images.map((img, idx) => (
          <div
            key={img.id}
            className="relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer group border border-base-300/40"
            onClick={() => setLightboxIdx(idx)}
          >
            <img
              src={getImageUrl(img)}
              alt={`${centerName} - маршрут ${idx + 1}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>

      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            className="absolute top-4 right-4 btn btn-circle btn-ghost text-white"
            onClick={() => setLightboxIdx(null)}
          >
            <X className="w-6 h-6" />
          </button>

          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 btn btn-circle btn-ghost text-white"
                onClick={e => {
                  e.stopPropagation()
                  setLightboxIdx(lightboxIdx > 0 ? lightboxIdx - 1 : images.length - 1)
                }}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                className="absolute right-4 btn btn-circle btn-ghost text-white"
                onClick={e => {
                  e.stopPropagation()
                  setLightboxIdx(lightboxIdx < images.length - 1 ? lightboxIdx + 1 : 0)
                }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <img
            src={getImageUrl(images[lightboxIdx])}
            alt={`${centerName} - маршрут ${lightboxIdx + 1}`}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={e => e.stopPropagation()}
          />

          <div className="absolute bottom-4 text-white/70 text-sm">
            {lightboxIdx + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  )
}

export default function RoutesPage() {
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedRegions, setExpandedRegions] = useState<Set<number>>(new Set())
  const [expandedCenters, setExpandedCenters] = useState<Set<number>>(new Set())

  useEffect(() => {
    api.get('/routes/regions/')
      .then(res => {
        setRegions(res.data)
        if (res.data.length === 1) {
          setExpandedRegions(new Set([res.data[0].id]))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggleRegion = (id: number) => {
    setExpandedRegions(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleCenter = (id: number) => {
    setExpandedCenters(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Екзаменаційні маршрути</h1>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Екзаменаційні маршрути</h1>
            <p className="text-base-content/50 text-sm">
              Маршрути для складання практичного іспиту по регіонах України
            </p>
          </div>
        </div>
      </div>

      {regions.length === 0 ? (
        <div className="card bg-base-100 border border-base-300/60">
          <div className="card-body items-center text-center py-12">
            <MapPin className="w-12 h-12 text-base-content/20 mb-3" />
            <p className="text-base-content/50">Маршрути ще не додано</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {regions.map(region => {
            const isRegionExpanded = expandedRegions.has(region.id)
            return (
              <div key={region.id} className="card bg-base-100 border border-base-300/60">
                <div
                  className="card-body p-4 cursor-pointer"
                  onClick={() => toggleRegion(region.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <h2 className="font-semibold">{region.name}</h2>
                        <p className="text-xs text-base-content/50 mt-0.5">
                          {region.centers.length} {region.centers.length === 1 ? 'центр' : region.centers.length < 5 ? 'центри' : 'центрів'}
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-base-content/30 transition-transform ${isRegionExpanded ? 'rotate-180' : ''}`}
                    />
                  </div>
                </div>

                {isRegionExpanded && (
                  <div className="border-t border-base-300/60 px-4 pb-4">
                    <div className="space-y-2 mt-3">
                      {region.centers.map(center => {
                        const isCenterExpanded = expandedCenters.has(center.id)
                        const hasContent = center.images.length > 0 || center.routes.length > 0
                        return (
                          <div
                            key={center.id}
                            className="rounded-xl bg-base-200/50 overflow-hidden"
                          >
                            <div
                              className={`flex items-center gap-3 p-3 ${hasContent ? 'cursor-pointer' : ''}`}
                              onClick={() => hasContent && toggleCenter(center.id)}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{center.name}</p>
                                {center.address && (
                                  <p className="text-xs text-base-content/50 mt-0.5">{center.address}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {center.images.length > 0 && (
                                  <span className="badge badge-primary badge-sm badge-outline">
                                    {center.images.length} фото
                                  </span>
                                )}
                                {hasContent && (
                                  <ChevronDown
                                    className={`w-4 h-4 text-base-content/30 transition-transform ${isCenterExpanded ? 'rotate-180' : ''}`}
                                  />
                                )}
                              </div>
                            </div>

                            {isCenterExpanded && (
                              <div className="px-3 pb-3">
                                <ImageGallery images={center.images} centerName={center.name} />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
