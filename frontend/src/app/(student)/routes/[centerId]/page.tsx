'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Phone, ExternalLink, Play, X, ChevronLeft, ChevronRight, Lock } from 'lucide-react'
import api from '@/lib/api'
import HlsPlayer from '@/components/video/HlsPlayer'

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

const ROUTE_VIDEOS: Record<number, Record<number, string>> = {
  54: {
    0: '/media/routes/video/route-1/master.m3u8',
  },
}

const mediaBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000'

function getImageUrl(img: RouteImage) {
  if (img.image) {
    if (img.image.startsWith('http')) return img.image
    return `${mediaBase}${img.image.startsWith('/') ? '' : '/'}${img.image}`
  }
  if (img.source_url) return img.source_url
  return ''
}

export default function CenterDetailPage() {
  const params = useParams()
  const router = useRouter()
  const centerId = Number(params.centerId)
  const [center, setCenter] = useState<ExamCenter | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  useEffect(() => {
    api.get(`/routes/centers/${centerId}/`)
      .then(res => setCenter(res.data))
      .catch(() => router.push('/routes'))
      .finally(() => setLoading(false))
  }, [centerId, router])

  if (loading) {
    return (
      <div>
        <div className="skeleton h-8 w-48 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton aspect-[4/3] rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!center) return null

  const centerVideos = ROUTE_VIDEOS[centerId] || {}
  const selectedImage = selectedRoute !== null ? center.images[selectedRoute] : null
  const selectedVideoUrl = selectedRoute !== null ? centerVideos[selectedRoute] : undefined

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/routes')}
          className="btn btn-ghost btn-sm gap-2 -ml-2 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Всі центри
        </button>

        <h1 className="text-xl font-bold mb-2">{center.name}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-base-content/60">
          {center.address && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>{center.city}, {center.address}</span>
            </div>
          )}
          {center.phone && (
            <a href={`tel:${center.phone}`} className="flex items-center gap-1.5 hover:text-primary">
              <Phone className="w-4 h-4" />
              <span>{center.phone}</span>
            </a>
          )}
        </div>
      </div>

      {/* Route grid or selected route */}
      {selectedRoute === null ? (
        <>
          <p className="text-sm text-base-content/50 mb-4">
            Оберіть маршрут для детального перегляду
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {center.images.map((img, idx) => {
              const hasVideo = centerVideos[idx] !== undefined
              return (
                <div
                  key={img.id}
                  onClick={() => setSelectedRoute(idx)}
                  className="relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer group border border-base-300/40 hover:border-primary/40 hover:shadow-md transition-all"
                >
                  <img
                    src={getImageUrl(img)}
                    alt={`Маршрут ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold text-sm">
                        Маршрут {idx + 1}
                      </span>
                      {hasVideo && (
                        <div className="flex items-center gap-1 bg-secondary/90 text-secondary-content rounded-full px-2 py-0.5 text-xs">
                          <Play className="w-3 h-3" />
                          <span>Відео</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <>
          {/* Selected route detail */}
          <button
            onClick={() => setSelectedRoute(null)}
            className="btn btn-ghost btn-sm gap-2 -ml-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Всі маршрути
          </button>

          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-lg font-bold">Маршрут {selectedRoute + 1}</h2>
            {/* Navigation between routes */}
            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={() => setSelectedRoute(selectedRoute > 0 ? selectedRoute - 1 : center.images.length - 1)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-base-content/50 min-w-[3rem] text-center">
                {selectedRoute + 1} / {center.images.length}
              </span>
              <button
                onClick={() => setSelectedRoute(selectedRoute < center.images.length - 1 ? selectedRoute + 1 : 0)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Route photo */}
            {selectedImage && (
              <div>
                <h3 className="text-sm font-medium text-base-content/70 mb-2">Схема маршруту</h3>
                <div
                  className="rounded-xl overflow-hidden border border-base-300/40 cursor-pointer"
                  onClick={() => setLightboxIdx(selectedRoute)}
                >
                  <img
                    src={getImageUrl(selectedImage)}
                    alt={`Маршрут ${selectedRoute + 1}`}
                    className="w-full max-h-[500px] object-contain bg-base-200"
                  />
                </div>
              </div>
            )}

            {/* Route video */}
            {selectedVideoUrl ? (
              <div>
                <h3 className="text-sm font-medium text-base-content/70 mb-2">Відеозапис проїзду маршруту</h3>
                <HlsPlayer src={`${mediaBase}${selectedVideoUrl}`} />
              </div>
            ) : (
              <div className="card bg-base-200/50 border border-base-300/40">
                <div className="card-body items-center text-center py-8">
                  <Lock className="w-8 h-8 text-base-content/20 mb-2" />
                  <p className="text-sm text-base-content/50">Відео для цього маршруту ще не додано</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Lightbox */}
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

          {center.images.length > 1 && (
            <>
              <button
                className="absolute left-4 btn btn-circle btn-ghost text-white"
                onClick={e => {
                  e.stopPropagation()
                  const newIdx = lightboxIdx > 0 ? lightboxIdx - 1 : center.images.length - 1
                  setLightboxIdx(newIdx)
                  setSelectedRoute(newIdx)
                }}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                className="absolute right-4 btn btn-circle btn-ghost text-white"
                onClick={e => {
                  e.stopPropagation()
                  const newIdx = lightboxIdx < center.images.length - 1 ? lightboxIdx + 1 : 0
                  setLightboxIdx(newIdx)
                  setSelectedRoute(newIdx)
                }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <img
            src={getImageUrl(center.images[lightboxIdx])}
            alt={`Маршрут ${lightboxIdx + 1}`}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={e => e.stopPropagation()}
          />

          <div className="absolute bottom-4 text-white/70 text-sm">
            Маршрут {lightboxIdx + 1} / {center.images.length}
          </div>
        </div>
      )}
    </div>
  )
}
