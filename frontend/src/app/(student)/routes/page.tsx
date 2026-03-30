'use client'

import { useEffect, useState } from 'react'
import { MapPin, Navigation, ChevronRight, Image as ImageIcon, Play } from 'lucide-react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

interface ExamCenter {
  id: number
  name: string
  city: string
  address: string
  phone: string
  images: { id: number }[]
  routes: { id: number }[]
}

interface Region {
  id: number
  name: string
  order: number
  centers: ExamCenter[]
}

const CENTERS_WITH_VIDEO = [54]

export default function RoutesPage() {
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    api.get('/routes/regions/')
      .then(res => setRegions(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Екзаменаційні маршрути</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-xl" />
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
              Оберіть екзаменаційний центр для перегляду маршрутів
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
        <div className="space-y-8">
          {regions.map(region => (
            <div key={region.id}>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">{region.name}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {region.centers.map(center => {
                  const hasVideo = CENTERS_WITH_VIDEO.includes(center.id)
                  return (
                    <div
                      key={center.id}
                      onClick={() => router.push(`/routes/${center.id}`)}
                      className="card bg-base-100 border border-base-300/60 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="card-body p-4">
                        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">
                          {center.name}
                        </h3>
                        {center.address && (
                          <p className="text-xs text-base-content/50 line-clamp-1">
                            {center.city}, {center.address}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-3">
                            {center.images.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-base-content/50">
                                <ImageIcon className="w-3.5 h-3.5" />
                                <span>{center.images.length} маршрутів</span>
                              </div>
                            )}
                            {hasVideo && (
                              <div className="flex items-center gap-1 text-xs text-secondary">
                                <Play className="w-3.5 h-3.5" />
                                <span>Відео</span>
                              </div>
                            )}
                          </div>
                          <ChevronRight className="w-4 h-4 text-base-content/30 group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
