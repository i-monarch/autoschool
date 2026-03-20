'use client'

import { useEffect, useState } from 'react'
import { MapPin, Phone, ChevronDown, ExternalLink, Navigation } from 'lucide-react'
import api from '@/lib/api'

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
  routes: ExamRoute[]
}

export default function RoutesPage() {
  const [centers, setCenters] = useState<ExamCenter[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useEffect(() => {
    api.get('/routes/centers/')
      .then(res => setCenters(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Екзаменаційні маршрути</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const cities = Array.from(new Set(centers.map(c => c.city)))

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Екзаменаційні маршрути</h1>
            <p className="text-base-content/50 text-sm">Сервісні центри МВС та маршрути для складання іспиту</p>
          </div>
        </div>
      </div>

      {centers.length === 0 ? (
        <div className="card bg-base-100 border border-base-300/60">
          <div className="card-body items-center text-center py-12">
            <MapPin className="w-12 h-12 text-base-content/20 mb-3" />
            <p className="text-base-content/50">Маршрути ще не додано</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {cities.map(city => (
            <div key={city}>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                {city}
              </h2>
              <div className="space-y-3">
                {centers.filter(c => c.city === city).map(center => {
                  const isExpanded = expandedId === center.id
                  return (
                    <div
                      key={center.id}
                      className="card bg-base-100 border border-base-300/60"
                    >
                      <div
                        className="card-body p-4 cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : center.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold">{center.name}</h3>
                            <p className="text-sm text-base-content/60 mt-1">{center.address}</p>
                            {center.phone && (
                              <p className="text-sm text-base-content/50 mt-1 flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5" />
                                {center.phone}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            {center.routes.length > 0 && (
                              <span className="badge badge-primary badge-sm">
                                {center.routes.length} {center.routes.length === 1 ? 'маршрут' : center.routes.length < 5 ? 'маршрути' : 'маршрутів'}
                              </span>
                            )}
                            <ChevronDown className={`w-5 h-5 text-base-content/30 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                      </div>

                      {isExpanded && center.routes.length > 0 && (
                        <div className="border-t border-base-300/60 px-4 pb-4">
                          <div className="space-y-2 mt-3">
                            {center.routes.map(route => (
                              <div
                                key={route.id}
                                className="flex items-start gap-3 p-3 rounded-lg bg-base-200/50"
                              >
                                <Navigation className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm">{route.name}</p>
                                  {route.description && (
                                    <p className="text-xs text-base-content/50 mt-1">{route.description}</p>
                                  )}
                                </div>
                                {route.map_url && (
                                  <a
                                    href={route.map_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-ghost btn-xs gap-1 flex-shrink-0"
                                    onClick={e => e.stopPropagation()}
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    На мапі
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {isExpanded && center.routes.length === 0 && (
                        <div className="border-t border-base-300/60 px-4 pb-4">
                          <p className="text-sm text-base-content/40 mt-3">Маршрути для цього центру ще не додано</p>
                        </div>
                      )}
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
