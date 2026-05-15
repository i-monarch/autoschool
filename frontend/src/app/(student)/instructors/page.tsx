'use client'

import { useCallback, useEffect, useState } from 'react'
import { BadgeCheck, Car, GraduationCap, Mail, Phone, UserRound } from 'lucide-react'
import { getCities } from '@/lib/api/cities'
import { getPublicInstructors } from '@/lib/api/instructors'
import type { City } from '@/types/cities'
import type { InstructorPublic } from '@/types/instructors'

function instructorName(instructor: InstructorPublic) {
  return `${instructor.first_name} ${instructor.last_name}`.trim() || 'Інструктор'
}

function formatPrice(price: number | null) {
  return price ? `${price.toLocaleString('uk-UA')} грн/год` : 'Ціну уточнюйте'
}

export default function InstructorsPage() {
  const [cities, setCities] = useState<City[]>([])
  const [instructors, setInstructors] = useState<InstructorPublic[]>([])
  const [selectedCity, setSelectedCity] = useState('')
  const [loading, setLoading] = useState(true)
  const [shownContacts, setShownContacts] = useState<Set<number>>(new Set())

  const loadInstructors = useCallback(async (citySlug: string) => {
    setLoading(true)
    try {
      const data = await getPublicInstructors(citySlug || undefined)
      setInstructors(data)
    } catch {
      setInstructors([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    async function loadInitial() {
      setLoading(true)
      try {
        const [cityData, instructorData] = await Promise.all([
          getCities(),
          getPublicInstructors(),
        ])
        setCities(cityData)
        setInstructors(instructorData)
      } catch {
        setCities([])
        setInstructors([])
      } finally {
        setLoading(false)
      }
    }

    loadInitial()
  }, [])

  useEffect(() => {
    if (selectedCity) {
      loadInstructors(selectedCity)
      setShownContacts(new Set())
    }
  }, [selectedCity, loadInstructors])

  const handleCityChange = (citySlug: string) => {
    setSelectedCity(citySlug)
    if (!citySlug) {
      loadInstructors('')
      setShownContacts(new Set())
    }
  }

  const toggleContacts = (id: number) => {
    setShownContacts((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Інструктори</h1>
          <p className="text-sm text-base-content/60 mt-1">
            Оберіть інструктора для практичних занять з водіння
          </p>
        </div>
        <select
          className="select select-bordered w-full sm:w-64"
          value={selectedCity}
          onChange={(event) => handleCityChange(event.target.value)}
        >
          <option value="">Всі міста</option>
          {cities.map((city) => (
            <option key={city.id} value={city.slug}>
              {city.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="card bg-base-100 border border-base-300/60">
              <div className="card-body">
                <div className="flex gap-4">
                  <div className="skeleton w-16 h-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-5 w-3/4" />
                    <div className="skeleton h-4 w-1/2" />
                  </div>
                </div>
                <div className="skeleton h-20 w-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : instructors.length === 0 ? (
        <div className="card bg-base-100 border border-base-300/60">
          <div className="card-body items-center text-center py-16">
            <GraduationCap className="w-12 h-12 text-base-content/20 mb-2" />
            <h2 className="text-lg font-semibold">Інструкторів не знайдено</h2>
            <p className="text-sm text-base-content/50">
              Спробуйте обрати інше місто або поверніться пізніше.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {instructors.map((instructor) => {
            const name = instructorName(instructor)
            const contactsVisible = shownContacts.has(instructor.id)
            return (
              <div
                key={instructor.id}
                className="card bg-base-100 border border-base-300/60 hover:border-primary/30 transition-colors"
              >
                <div className="card-body p-5">
                  <div className="flex items-start gap-4">
                    {instructor.photo ? (
                      <img
                        src={instructor.photo}
                        alt={name}
                        className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <UserRound className="w-8 h-8 text-primary/60" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h2 className="font-semibold text-lg leading-tight">{name}</h2>
                      <p className="text-sm text-base-content/50">
                        {instructor.city?.name || 'Місто не вказано'}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {instructor.is_official && (
                          <span className="badge badge-success badge-sm gap-1">
                            <BadgeCheck className="w-3 h-3" />
                            Офіційний
                          </span>
                        )}
                        {instructor.is_car_equipped && (
                          <span className="badge badge-info badge-sm gap-1">
                            <Car className="w-3 h-3" />
                            Авто з педалями
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg bg-base-200/70 p-3">
                    {instructor.car_photo ? (
                      <img
                        src={instructor.car_photo}
                        alt={instructor.car_model || 'Автомобіль інструктора'}
                        className="w-16 h-12 rounded-md object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-12 rounded-md bg-base-300/60 flex items-center justify-center flex-shrink-0">
                        <Car className="w-6 h-6 text-base-content/40" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs text-base-content/50">Автомобіль</p>
                      <p className="font-medium text-sm truncate">
                        {instructor.car_model || 'Модель не вказано'}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-base-content/60 line-clamp-3 min-h-[3.75rem]">
                    {instructor.description || 'Опис буде додано пізніше.'}
                  </p>

                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-base-300/50">
                    <p className="font-semibold">{formatPrice(instructor.price_per_hour)}</p>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => toggleContacts(instructor.id)}
                    >
                      {contactsVisible ? 'Сховати' : 'Зв’язатися'}
                    </button>
                  </div>

                  {contactsVisible && (
                    <div className="rounded-lg border border-base-300/60 p-3 space-y-2">
                      {instructor.phone ? (
                        <a className="flex items-center gap-2 text-sm" href={`tel:${instructor.phone}`}>
                          <Phone className="w-4 h-4 text-primary" />
                          {instructor.phone}
                        </a>
                      ) : null}
                      {instructor.email ? (
                        <a className="flex items-center gap-2 text-sm" href={`mailto:${instructor.email}`}>
                          <Mail className="w-4 h-4 text-primary" />
                          {instructor.email}
                        </a>
                      ) : null}
                      {!instructor.phone && !instructor.email && (
                        <p className="text-sm text-base-content/50">Контакти поки не вказані.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
