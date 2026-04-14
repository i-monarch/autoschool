'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Calendar, Clock, Video, BookOpen, Car,
  ChevronLeft, ChevronRight, Check, X as XIcon,
} from 'lucide-react'
import api from '@/lib/api'
import { useToast } from '@/components/ui/Toast'

interface AvailableSlot {
  id: number
  date: string
  start_time: string
  end_time: string
  lesson_type: string
  title: string
  description: string
  teacher_name: string
  teacher_avatar: string | null
  max_students: number
  spots_left: number
}

interface MyBooking {
  id: number
  status: string
  created_at: string
  date: string
  start_time: string
  end_time: string
  lesson_type: string
  title: string
  meet_url: string
  teacher_name: string
}

const LESSON_TYPE_INFO: Record<string, { text: string; short: string; icon: typeof Video; bg: string; color: string }> = {
  online: { text: 'Онлайн-консультація', short: 'Онлайн', icon: Video, bg: 'bg-info/10', color: 'text-info' },
  theory: { text: 'Теорія', short: 'Теорія', icon: BookOpen, bg: 'bg-primary/10', color: 'text-primary' },
  practice: { text: 'Практика', short: 'Практика', icon: Car, bg: 'bg-secondary/10', color: 'text-secondary' },
}

function getWeekDates(baseDate: Date): Date[] {
  const start = new Date(baseDate)
  const day = start.getDay()
  const diff = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + diff)
  const dates: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    dates.push(d)
  }
  return dates
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']

export default function SchedulePage() {
  const toast = useToast()

  const [tab, setTab] = useState<'book' | 'my'>('book')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [bookings, setBookings] = useState<MyBooking[]>([])
  const [loadingSlots, setLoadingSlots] = useState(true)
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [bookingInProgress, setBookingInProgress] = useState<number | null>(null)
  const [cancellingId, setCancellingId] = useState<number | null>(null)

  const weekDates = getWeekDates(currentDate)
  const weekStart = formatDate(weekDates[0])
  const weekEnd = formatDate(weekDates[6])

  const fetchSlots = useCallback(async () => {
    setLoadingSlots(true)
    try {
      const { data } = await api.get<AvailableSlot[]>('/schedule/slots/', {
        params: { date_from: weekStart, date_to: weekEnd },
      })
      setSlots(data)
    } catch {
      toast.add('Помилка завантаження', 'error')
    } finally {
      setLoadingSlots(false)
    }
  }, [weekStart, weekEnd])

  const fetchBookings = useCallback(async () => {
    setLoadingBookings(true)
    try {
      const { data } = await api.get<MyBooking[]>('/schedule/bookings/')
      setBookings(data)
    } catch {
      toast.add('Помилка завантаження', 'error')
    } finally {
      setLoadingBookings(false)
    }
  }, [])

  useEffect(() => {
    fetchSlots()
  }, [fetchSlots])

  useEffect(() => {
    if (tab === 'my') fetchBookings()
  }, [tab, fetchBookings])

  const prevWeek = () => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() - 7)
    setCurrentDate(d)
  }

  const nextWeek = () => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + 7)
    setCurrentDate(d)
  }

  const goToday = () => setCurrentDate(new Date())

  const handleBook = async (slotId: number) => {
    setBookingInProgress(slotId)
    try {
      await api.post('/schedule/bookings/create/', { slot_id: slotId })
      toast.add('Ви успішно записалися!', 'success')
      fetchSlots()
      fetchBookings()
    } catch (err: any) {
      const msg = err.response?.data?.slot_id?.[0] || err.response?.data?.detail || 'Помилка запису'
      toast.add(msg, 'error')
    } finally {
      setBookingInProgress(null)
    }
  }

  const handleCancel = async (bookingId: number) => {
    setCancellingId(bookingId)
    try {
      await api.post(`/schedule/bookings/${bookingId}/cancel/`)
      toast.add('Запис скасовано', 'success')
      fetchBookings()
      fetchSlots()
    } catch {
      toast.add('Помилка скасування', 'error')
    } finally {
      setCancellingId(null)
    }
  }

  const today = formatDate(new Date())

  const monthRange = (() => {
    const m1 = weekDates[0].toLocaleDateString('uk-UA', { month: 'long' })
    const m2 = weekDates[6].toLocaleDateString('uk-UA', { month: 'long' })
    const y = weekDates[0].getFullYear()
    return m1 === m2 ? `${m1} ${y}` : `${m1} - ${m2} ${y}`
  })()

  const upcomingBookings = bookings.filter(b => b.status === 'booked')
  const pastBookings = bookings.filter(b => b.status !== 'booked')

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Розклад занять</h1>
          <p className="text-base-content/60 text-sm mt-1">Онлайн-заняття з викладачем</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed bg-base-200/50 p-1 mb-6 w-fit">
        <button
          className={`tab tab-sm ${tab === 'book' ? 'tab-active' : ''}`}
          onClick={() => setTab('book')}
        >
          Записатися
        </button>
        <button
          className={`tab tab-sm ${tab === 'my' ? 'tab-active' : ''}`}
          onClick={() => setTab('my')}
        >
          Мої заняття
          {upcomingBookings.length > 0 && (
            <span className="badge badge-sm badge-primary ml-1.5">{upcomingBookings.length}</span>
          )}
        </button>
      </div>

      {/* Tab: Book */}
      {tab === 'book' && (
        <>
          {/* Week navigation */}
          <div className="flex items-center gap-3 mb-6">
            <button className="btn btn-ghost btn-sm btn-square" onClick={prevWeek}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium capitalize min-w-[180px] text-center">{monthRange}</span>
            <button className="btn btn-ghost btn-sm btn-square" onClick={nextWeek}>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button className="btn btn-ghost btn-xs ml-2" onClick={goToday}>Сьогодні</button>
          </div>

          {loadingSlots ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-md" />
            </div>
          ) : slots.length === 0 ? (
            <div className="card bg-base-100 border border-base-300/60">
              <div className="card-body items-center text-center py-16">
                <div className="w-20 h-20 rounded-2xl bg-info/5 flex items-center justify-center mb-4">
                  <Calendar className="w-9 h-9 text-info/40" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Немає доступних занять</h3>
                <p className="text-base-content/60 max-w-md text-sm">
                  На цьому тижні немає вільних слотів. Спробуйте переглянути наступний тиждень.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {weekDates.map((date, i) => {
                const dateStr = formatDate(date)
                const isToday = dateStr === today
                const daySlots = slots.filter(s => s.date === dateStr)
                if (daySlots.length === 0) return null

                return (
                  <div key={dateStr}>
                    <div className={`flex items-center gap-3 mb-3 ${isToday ? 'text-primary' : 'text-base-content/70'}`}>
                      <div className={`flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold ${
                        isToday ? 'bg-primary text-primary-content' : 'bg-base-200'
                      }`}>
                        {date.getDate()}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${isToday ? 'text-primary' : ''}`}>
                          {DAY_NAMES[i]}, {date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })}
                        </p>
                        <p className="text-xs text-base-content/40">{daySlots.length} {daySlots.length === 1 ? 'слот' : daySlots.length < 5 ? 'слоти' : 'слотів'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ml-[52px]">
                      {daySlots.map(slot => {
                        const typeInfo = LESSON_TYPE_INFO[slot.lesson_type] || LESSON_TYPE_INFO.online
                        const TypeIcon = typeInfo.icon
                        const isBookingSlot = bookingInProgress === slot.id

                        return (
                          <div
                            key={slot.id}
                            className="card bg-base-100 border border-base-300/60 p-4 hover:border-primary/30 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold">
                                {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${typeInfo.bg} ${typeInfo.color}`}>
                                <TypeIcon className="w-3 h-3" />
                                {typeInfo.short}
                              </span>
                            </div>

                            {slot.title && (
                              <p className="text-sm font-medium mb-1 line-clamp-2">{slot.title}</p>
                            )}

                            <p className="text-xs text-base-content/50 mb-3">{slot.teacher_name}</p>

                            <div className="flex items-center justify-between mt-auto">
                              <span className="text-xs text-base-content/40">
                                {slot.spots_left} з {slot.max_students} місць
                              </span>
                              <button
                                className="btn btn-xs btn-primary"
                                onClick={() => handleBook(slot.id)}
                                disabled={isBookingSlot || slot.spots_left === 0}
                              >
                                {isBookingSlot
                                  ? <span className="loading loading-spinner loading-xs" />
                                  : 'Записатися'
                                }
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Tab: My bookings */}
      {tab === 'my' && (
        <>
          {loadingBookings ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-md" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="card bg-base-100 border border-base-300/60">
              <div className="card-body items-center text-center py-16">
                <div className="w-20 h-20 rounded-2xl bg-info/5 flex items-center justify-center mb-4">
                  <Calendar className="w-9 h-9 text-info/40" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Немає записів</h3>
                <p className="text-base-content/60 max-w-md text-sm">
                  Ви ще не записувалися на заняття. Перейдіть на вкладку "Записатися".
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Upcoming */}
              {upcomingBookings.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm mb-3">Майбутні заняття</h3>
                  <div className="space-y-2">
                    {upcomingBookings.map(b => {
                      const typeInfo = LESSON_TYPE_INFO[b.lesson_type] || LESSON_TYPE_INFO.online
                      const TypeIcon = typeInfo.icon
                      const isCancelling = cancellingId === b.id

                      return (
                        <div
                          key={b.id}
                          className="card bg-base-100 border border-base-300/60 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${typeInfo.bg} ${typeInfo.color}`}>
                                  <TypeIcon className="w-3 h-3" />
                                  {typeInfo.short}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-success/10 text-success">
                                  <Check className="w-3 h-3" />
                                  Записано
                                </span>
                              </div>

                              {b.title && <p className="font-medium mb-1">{b.title}</p>}

                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-base-content/60">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {new Date(b.date).toLocaleDateString('uk-UA', {
                                    weekday: 'short', day: 'numeric', month: 'long',
                                  })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {b.start_time.slice(0, 5)} - {b.end_time.slice(0, 5)}
                                </span>
                              </div>

                              <p className="text-sm text-base-content/50 mt-1">{b.teacher_name}</p>

                              {b.meet_url && (
                                <a
                                  href={b.meet_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-sm btn-outline mt-3 gap-1.5"
                                >
                                  <Video className="w-3.5 h-3.5" />
                                  Приєднатися
                                </a>
                              )}
                            </div>

                            <button
                              className="btn btn-sm btn-ghost btn-square text-base-content/40 hover:text-error"
                              onClick={() => handleCancel(b.id)}
                              disabled={isCancelling}
                              title="Скасувати запис"
                            >
                              {isCancelling
                                ? <span className="loading loading-spinner loading-xs" />
                                : <XIcon className="w-4 h-4" />
                              }
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Past */}
              {pastBookings.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm mb-3 text-base-content/50">Минулі / Скасовані</h3>
                  <div className="space-y-2">
                    {pastBookings.map(b => {
                      const typeInfo = LESSON_TYPE_INFO[b.lesson_type] || LESSON_TYPE_INFO.online

                      return (
                        <div
                          key={b.id}
                          className="card bg-base-100 border border-base-300/60 p-4 opacity-60"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-base-200 text-base-content/60">
                                  {typeInfo.short}
                                </span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                                  b.status === 'completed' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                                }`}>
                                  {b.status === 'completed' ? 'Завершено' : 'Скасовано'}
                                </span>
                              </div>
                              {b.title && <p className="text-sm">{b.title}</p>}
                              <p className="text-xs text-base-content/50">
                                {new Date(b.date).toLocaleDateString('uk-UA', {
                                  day: 'numeric', month: 'long',
                                })} | {b.start_time.slice(0, 5)} - {b.end_time.slice(0, 5)} | {b.teacher_name}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
