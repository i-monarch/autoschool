'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Plus, ChevronLeft, ChevronRight, Clock,
  Users, Video, X, Trash2,
} from 'lucide-react'
import api from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import SlotModal from './SlotModal'

interface SlotBooking {
  id: number
  student_name: string
  student_phone: string | null
  status: string
  created_at: string
}

interface TeacherSlot {
  id: number
  date: string
  start_time: string
  end_time: string
  lesson_type: string
  title: string
  description: string
  meet_url: string
  max_students: number
  status: string
  bookings_count: number
  bookings?: SlotBooking[]
}

interface Stats {
  total_slots: number
  total_bookings: number
  this_week: number
}

const STATUS_BADGES: Record<string, string> = {
  available: 'badge-success',
  full: 'badge-warning',
  cancelled: 'badge-error',
}

const STATUS_LABELS: Record<string, string> = {
  available: 'Вільний',
  full: 'Зайнятий',
  cancelled: 'Скасовано',
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

export default function TeacherSchedulePage() {
  const toast = useToast()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [slots, setSlots] = useState<TeacherSlot[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<TeacherSlot | null>(null)
  const [detailSlot, setDetailSlot] = useState<TeacherSlot | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const [creatingSlot, setCreatingSlot] = useState(false)
  const [editingSlot, setEditingSlot] = useState<TeacherSlot | null>(null)
  const [createDate, setCreateDate] = useState<string | undefined>()

  const weekDates = getWeekDates(currentDate)
  const weekStart = formatDate(weekDates[0])
  const weekEnd = formatDate(weekDates[6])

  const fetchSlots = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get<TeacherSlot[]>('/teacher/schedule/slots/', {
        params: { date_from: weekStart, date_to: weekEnd },
      })
      setSlots(data)
    } catch {
      toast.add('Помилка завантаження', 'error')
    } finally {
      setLoading(false)
    }
  }, [weekStart, weekEnd])

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get<Stats>('/teacher/schedule/stats/')
      setStats(data)
    } catch {}
  }, [])

  const fetchSlotDetail = useCallback(async (id: number) => {
    setLoadingDetail(true)
    try {
      const { data } = await api.get<TeacherSlot>(`/teacher/schedule/slots/${id}/`)
      setDetailSlot(data)
    } catch {
      toast.add('Помилка завантаження деталей', 'error')
    } finally {
      setLoadingDetail(false)
    }
  }, [])

  useEffect(() => {
    fetchSlots()
    fetchStats()
  }, [fetchSlots, fetchStats])

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

  const handleCancelSlot = async (slotId: number) => {
    try {
      await api.post(`/teacher/schedule/slots/${slotId}/cancel/`)
      toast.add('Слот скасовано', 'success')
      fetchSlots()
      fetchStats()
      setDetailSlot(null)
      setSelectedSlot(null)
    } catch {
      toast.add('Помилка скасування', 'error')
    }
  }

  const handleRestoreSlot = async (slotId: number) => {
    try {
      await api.post(`/teacher/schedule/slots/${slotId}/restore/`)
      toast.add('Слот відновлено', 'success')
      fetchSlots()
      fetchStats()
      setDetailSlot(null)
      setSelectedSlot(null)
    } catch {
      toast.add('Помилка відновлення', 'error')
    }
  }

  const handleDeleteSlot = async (slotId: number) => {
    try {
      await api.delete(`/teacher/schedule/slots/${slotId}/`)
      toast.add('Слот видалено', 'success')
      fetchSlots()
      fetchStats()
      setDetailSlot(null)
      setSelectedSlot(null)
    } catch {
      toast.add('Помилка видалення', 'error')
    }
  }

  const handleSlotSaved = () => {
    setCreatingSlot(false)
    setEditingSlot(null)
    setCreateDate(undefined)
    fetchSlots()
    fetchStats()
  }

  const handleSlotClick = (slot: TeacherSlot) => {
    setSelectedSlot(slot)
    fetchSlotDetail(slot.id)
  }

  const handleDayHeaderClick = (date: string) => {
    setCreateDate(date)
    setCreatingSlot(true)
  }

  const today = formatDate(new Date())

  const monthRange = (() => {
    const m1 = weekDates[0].toLocaleDateString('uk-UA', { month: 'long' })
    const m2 = weekDates[6].toLocaleDateString('uk-UA', { month: 'long' })
    const y = weekDates[0].getFullYear()
    return m1 === m2 ? `${m1} ${y}` : `${m1} - ${m2} ${y}`
  })()

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Розклад</h1>
          <p className="text-base-content/60 text-sm mt-1">Управління слотами та заняттями</p>
        </div>
        <button
          className="btn btn-primary btn-sm gap-2"
          onClick={() => { setCreateDate(undefined); setCreatingSlot(true) }}
        >
          <Plus className="w-4 h-4" />
          Додати слот
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card bg-base-100 border border-base-300/60 p-4">
            <p className="text-2xl font-bold">{stats.total_slots}</p>
            <p className="text-xs text-base-content/50">Слотів</p>
          </div>
          <div className="card bg-base-100 border border-base-300/60 p-4">
            <p className="text-2xl font-bold">{stats.total_bookings}</p>
            <p className="text-xs text-base-content/50">Записів</p>
          </div>
          <div className="card bg-base-100 border border-base-300/60 p-4">
            <p className="text-2xl font-bold">{stats.this_week}</p>
            <p className="text-xs text-base-content/50">Цього тижня</p>
          </div>
        </div>
      )}

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

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Week calendar */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-md" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {weekDates.map((date, i) => {
                const dateStr = formatDate(date)
                const isToday = dateStr === today
                const daySlots = slots.filter(s => s.date === dateStr)

                return (
                  <div key={dateStr} className="min-h-[160px]">
                    {/* Day header */}
                    <button
                      className={`w-full text-center py-2 rounded-lg mb-1 text-sm transition-colors hover:bg-primary/10 ${
                        isToday ? 'bg-primary/10 font-bold text-primary' : 'text-base-content/70'
                      }`}
                      onClick={() => handleDayHeaderClick(dateStr)}
                      title="Натисніть щоб створити слот"
                    >
                      <div className="text-xs">{DAY_NAMES[i]}</div>
                      <div className="text-lg">{date.getDate()}</div>
                    </button>

                    {/* Slots */}
                    <div className="space-y-1">
                      {daySlots.map(slot => {
                        const isSelected = selectedSlot?.id === slot.id

                        return (
                          <button
                            key={slot.id}
                            className={`w-full text-left p-2 rounded-lg border text-xs transition-all ${
                              slot.status === 'cancelled'
                                ? 'opacity-40 border-base-300/60'
                                : isSelected
                                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                  : 'border-base-300/60 hover:border-primary/40 bg-base-100'
                            }`}
                            onClick={() => handleSlotClick(slot)}
                          >
                            <div className="flex items-center gap-1 mb-0.5">
                              <Video className="w-3 h-3 flex-shrink-0 text-info" />
                              <span className="truncate font-medium">
                                {slot.start_time.slice(0, 5)}-{slot.end_time.slice(0, 5)}
                              </span>
                            </div>
                            {slot.title && (
                              <p className="truncate text-base-content/60">{slot.title}</p>
                            )}
                            <div className="flex items-center gap-1 mt-0.5">
                              <Users className="w-3 h-3" />
                              <span>{slot.bookings_count}{slot.max_students > 0 ? `/${slot.max_students}` : ''}</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Slot detail sidebar */}
        {selectedSlot && (
          <div className="lg:w-80 flex-shrink-0">
            <div className="card bg-base-100 border border-base-300/60 lg:sticky lg:top-20">
              <div className="card-body p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Деталі слоту</h3>
                  <button
                    className="btn btn-ghost btn-xs btn-square"
                    onClick={() => { setSelectedSlot(null); setDetailSlot(null) }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {loadingDetail ? (
                  <div className="flex justify-center py-6">
                    <span className="loading loading-spinner loading-sm" />
                  </div>
                ) : detailSlot ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-base-content/50">Дата і час</p>
                      <p className="font-medium">
                        {new Date(detailSlot.date).toLocaleDateString('uk-UA', {
                          weekday: 'long', day: 'numeric', month: 'long',
                        })}
                      </p>
                      <p className="flex items-center gap-1 text-sm">
                        <Clock className="w-3.5 h-3.5" />
                        {detailSlot.start_time.slice(0, 5)} - {detailSlot.end_time.slice(0, 5)}
                      </p>
                    </div>

                    {detailSlot.title && (
                      <div>
                        <p className="text-xs text-base-content/50">Назва</p>
                        <p className="text-sm">{detailSlot.title}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-xs text-base-content/50">Статус</p>
                      <span className={`badge badge-sm ${STATUS_BADGES[detailSlot.status]}`}>
                        {STATUS_LABELS[detailSlot.status]}
                      </span>
                    </div>

                    {detailSlot.meet_url && (
                      <div>
                        <p className="text-xs text-base-content/50">Посилання</p>
                        <a
                          href={detailSlot.meet_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm link link-primary break-all"
                        >
                          {detailSlot.meet_url}
                        </a>
                      </div>
                    )}

                    {/* Bookings */}
                    {detailSlot.bookings && detailSlot.bookings.length > 0 && (
                      <div>
                        <p className="text-xs text-base-content/50 mb-2">
                          Записані ({detailSlot.bookings.filter(b => b.status === 'booked').length}/{detailSlot.max_students})
                        </p>
                        <div className="space-y-1.5">
                          {detailSlot.bookings.map(b => (
                            <div
                              key={b.id}
                              className={`flex items-center justify-between text-sm p-2 rounded bg-base-200/50 ${
                                b.status === 'cancelled' ? 'opacity-40 line-through' : ''
                              }`}
                            >
                              <div>
                                <p className="font-medium">{b.student_name}</p>
                                {b.student_phone && (
                                  <p className="text-xs text-base-content/50">{b.student_phone}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {detailSlot.bookings && detailSlot.bookings.length === 0 && (
                      <p className="text-sm text-base-content/50">Поки ніхто не записався</p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-base-300/60">
                      {detailSlot.status !== 'cancelled' && (
                        <>
                          <button
                            className="btn btn-sm btn-ghost flex-1"
                            onClick={() => { setEditingSlot(detailSlot); setSelectedSlot(null); setDetailSlot(null) }}
                          >
                            Редагувати
                          </button>
                          <button
                            className="btn btn-sm btn-error btn-outline flex-1"
                            onClick={() => handleCancelSlot(detailSlot.id)}
                          >
                            Скасувати слот
                          </button>
                        </>
                      )}
                      {detailSlot.status === 'cancelled' && (
                        <>
                          <button
                            className="btn btn-sm btn-primary btn-outline flex-1"
                            onClick={() => handleRestoreSlot(detailSlot.id)}
                          >
                            Відновити
                          </button>
                          <button
                            className="btn btn-sm btn-error btn-outline flex-1 gap-1"
                            onClick={() => handleDeleteSlot(detailSlot.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Видалити
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {(creatingSlot || editingSlot) && (
        <SlotModal
          slot={editingSlot}
          defaultDate={createDate}
          onClose={() => { setCreatingSlot(false); setEditingSlot(null); setCreateDate(undefined) }}
          onSaved={handleSlotSaved}
        />
      )}
    </div>
  )
}
