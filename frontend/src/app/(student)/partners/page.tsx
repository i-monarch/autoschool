'use client'

import { useEffect, useState } from 'react'
import { Building2, MapPin, Phone, Globe, Mail, Search } from 'lucide-react'
import api from '@/lib/api'

interface Partner {
  id: number
  name: string
  slug: string
  description: string
  logo: string | null
  city: string
  address: string
  phone: string
  website: string
  email: string
  services: string
  price_from: number | null
  rating: number
}

const SERVICE_LABELS: Record<string, string> = {
  theory: 'Теорія',
  practice: 'Практика',
  exam: 'Супровід на іспит',
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get<Partner[]>('/partners/')
      .then(res => setPartners(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = search
    ? partners.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.city.toLowerCase().includes(search.toLowerCase())
      )
    : partners

  const cities = Array.from(new Set(partners.map(p => p.city))).sort()

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Автошколи-партнери</h1>
          <p className="text-base-content/60 text-sm mt-1">
            Оберіть автошколу для практичного навчання та складання іспиту
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-base-content/30" />
        <input
          type="text"
          className="input input-bordered w-full pl-10"
          placeholder="Пошук за назвою або містом..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* City filters */}
      {cities.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            className={`btn btn-sm ${!search ? 'btn-primary' : 'btn-ghost border border-base-300/60'}`}
            onClick={() => setSearch('')}
          >
            Всі міста
          </button>
          {cities.map(city => (
            <button
              key={city}
              className={`btn btn-sm ${search === city ? 'btn-primary' : 'btn-ghost border border-base-300/60'}`}
              onClick={() => setSearch(city)}
            >
              {city}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-52 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card bg-base-100 border border-base-300/60">
          <div className="card-body items-center text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-base-200 flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-base-content/20" />
            </div>
            <h3 className="font-semibold text-lg mb-1">
              {search ? 'Нічого не знайдено' : 'Поки немає автошкіл'}
            </h3>
            <p className="text-base-content/50 text-sm">
              {search ? 'Спробуйте змінити пошуковий запит' : 'Автошколи-партнери з\'являться тут найближчим часом'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(partner => (
            <div key={partner.id} className="card bg-base-100 border border-base-300/60 hover:border-primary/30 transition-colors">
              <div className="card-body p-5">
                <div className="flex items-start gap-4 mb-3">
                  {partner.logo ? (
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-7 h-7 text-primary/60" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold">{partner.name}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-base-content/50">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{partner.city}{partner.address ? `, ${partner.address}` : ''}</span>
                    </div>
                  </div>
                  {partner.rating > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-600 flex-shrink-0">
                      <span className="text-sm font-bold">{partner.rating}</span>
                    </div>
                  )}
                </div>

                {partner.description && (
                  <p className="text-sm text-base-content/60 mb-3 line-clamp-2">{partner.description}</p>
                )}

                {/* Services */}
                {partner.services && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {partner.services.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                      <span key={s} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary">
                        {SERVICE_LABELS[s] || s}
                      </span>
                    ))}
                  </div>
                )}

                {partner.price_from && (
                  <p className="text-sm mb-3">
                    <span className="text-base-content/50">від </span>
                    <span className="font-semibold">{partner.price_from.toLocaleString()} грн</span>
                  </p>
                )}

                {/* Contacts */}
                <div className="flex flex-wrap gap-2 pt-3 border-t border-base-300/40">
                  {partner.phone && (
                    <a href={`tel:${partner.phone}`} className="btn btn-sm btn-ghost gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      {partner.phone}
                    </a>
                  )}
                  {partner.website && (
                    <a href={partner.website} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-ghost gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      Сайт
                    </a>
                  )}
                  {partner.email && (
                    <a href={`mailto:${partner.email}`} className="btn btn-sm btn-ghost gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      Email
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
