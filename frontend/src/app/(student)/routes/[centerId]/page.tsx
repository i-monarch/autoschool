'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Phone, Play, X, ChevronLeft, ChevronRight, Lock, Map } from 'lucide-react'
import api from '@/lib/api'
import HlsPlayer from '@/components/video/HlsPlayer'

interface RouteImage {
  id: number
  image: string | null
  source_url: string
  video_url: string
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
  const [selectedRoute, setSelectedRoute] = useState<number>(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    api.get(`/routes/centers/${centerId}/`)
      .then(res => setCenter(res.data))
      .catch(() => router.push('/routes'))
      .finally(() => setLoading(false))
  }, [centerId, router])

  if (loading) {
    return (
      <div>
        <div className="skeleton h-8 w-48 mb-4" />
        <div className="skeleton h-6 w-72 mb-6" />
        <div className="flex gap-2 mb-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="skeleton w-10 h-10 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="skeleton aspect-[4/3] rounded-xl" />
          <div className="skeleton aspect-video rounded-xl" />
        </div>
      </div>
    )
  }

  if (!center || center.images.length === 0) return null

  const currentImage = center.images[selectedRoute]
  const currentVideoUrl = currentImage?.video_url || ''
  const totalRoutes = center.images.length

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/routes')}
          className="btn btn-ghost btn-sm gap-2 -ml-2 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Всі центри
        </button>

        <h1 className="text-xl font-bold">{center.name}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-base-content/60 mt-1">
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

      {/* Route selector strip */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Map className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Оберіть маршрут:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: totalRoutes }, (_, idx) => {
            const hasVideo = !!center.images[idx]?.video_url
            const isActive = selectedRoute === idx
            return (
              <button
                key={idx}
                onClick={() => setSelectedRoute(idx)}
                className={`relative w-11 h-11 rounded-lg font-semibold text-sm transition-all
                  ${isActive
                    ? 'bg-primary text-primary-content shadow-md scale-105'
                    : 'bg-base-200 hover:bg-base-300 text-base-content'
                  }`}
              >
                {idx + 1}
                {hasVideo && (
                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center
                    ${isActive ? 'bg-secondary text-secondary-content' : 'bg-secondary/80 text-secondary-content'}`}
                  >
                    <Play className="w-2.5 h-2.5" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Route content */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Маршрут {selectedRoute + 1}</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSelectedRoute(selectedRoute > 0 ? selectedRoute - 1 : totalRoutes - 1)}
            className="btn btn-ghost btn-sm btn-square"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedRoute(selectedRoute < totalRoutes - 1 ? selectedRoute + 1 : 0)}
            className="btn btn-ghost btn-sm btn-square"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Scheme card */}
        <div className="card bg-base-100 border border-base-300/60">
          <div className="card-body p-4">
            <h3 className="text-sm font-medium text-base-content/60 mb-2">Схема маршруту</h3>
            <div
              className="rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setLightboxOpen(true)}
            >
              <img
                src={getImageUrl(currentImage)}
                alt={`Маршрут ${selectedRoute + 1}`}
                className="w-full object-contain bg-base-200 max-h-[400px]"
              />
            </div>
          </div>
        </div>

        {/* Video card */}
        <div className="card bg-base-100 border border-base-300/60">
          <div className="card-body p-4">
            <h3 className="text-sm font-medium text-base-content/60 mb-2">Відеозапис проїзду</h3>
            {currentVideoUrl ? (
              <HlsPlayer src={`${mediaBase}${currentVideoUrl}`} />
            ) : (
              <div className="flex flex-col items-center justify-center bg-base-200/50 rounded-lg aspect-video">
                <Lock className="w-8 h-8 text-base-content/15 mb-2" />
                <p className="text-sm text-base-content/40">Відео незабаром</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 btn btn-circle btn-ghost text-white"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>

          <button
            className="absolute left-4 btn btn-circle btn-ghost text-white"
            onClick={e => {
              e.stopPropagation()
              setSelectedRoute(selectedRoute > 0 ? selectedRoute - 1 : totalRoutes - 1)
            }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            className="absolute right-4 btn btn-circle btn-ghost text-white"
            onClick={e => {
              e.stopPropagation()
              setSelectedRoute(selectedRoute < totalRoutes - 1 ? selectedRoute + 1 : 0)
            }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <img
            src={getImageUrl(currentImage)}
            alt={`Маршрут ${selectedRoute + 1}`}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={e => e.stopPropagation()}
          />

          <div className="absolute bottom-4 text-white/70 text-sm">
            Маршрут {selectedRoute + 1} з {totalRoutes}
          </div>
        </div>
      )}
    </div>
  )
}
