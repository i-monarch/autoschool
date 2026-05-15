'use client'

import { useCallback, useEffect, useState } from 'react'
import { BadgeCheck, ChevronLeft, ChevronRight, Clock, GraduationCap, Users } from 'lucide-react'
import { getAdminCities } from '@/lib/api/cities'
import {
  deleteInstructor,
  getAdminInstructors,
  getAdminInstructorStats,
  rejectInstructor,
  verifyInstructor,
} from '@/lib/api/instructors'
import { useToast } from '@/components/ui/Toast'
import type { AdminCity } from '@/lib/api/cities'
import type { InstructorAdmin, InstructorStats } from '@/types/instructors'
import DeleteConfirmModal from './DeleteConfirmModal'
import InstructorRow from './InstructorRow'
import RejectNoteModal from './RejectNoteModal'

type InstructorStatus = '' | 'pending' | 'verified'

const PAGE_SIZE = 20

function instructorName(instructor: InstructorAdmin) {
  return `${instructor.first_name} ${instructor.last_name}`.trim() || `Інструктор #${instructor.id}`
}

export default function AdminInstructorsPage() {
  const addToast = useToast((state) => state.add)
  const [stats, setStats] = useState<InstructorStats | null>(null)
  const [cities, setCities] = useState<AdminCity[]>([])
  const [instructors, setInstructors] = useState<InstructorAdmin[]>([])
  const [status, setStatus] = useState<InstructorStatus>('pending')
  const [city, setCity] = useState('')
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const [next, setNext] = useState<string | null>(null)
  const [previous, setPrevious] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<number | null>(null)
  const [rejecting, setRejecting] = useState<InstructorAdmin | null>(null)
  const [deleting, setDeleting] = useState<InstructorAdmin | null>(null)

  const loadStats = useCallback(async () => {
    try {
      const data = await getAdminInstructorStats()
      setStats(data)
    } catch {
      addToast('Помилка завантаження статистики', 'error')
    }
  }, [addToast])

  const loadCities = useCallback(async () => {
    try {
      const data = await getAdminCities()
      setCities(data)
    } catch {
      addToast('Помилка завантаження міст', 'error')
    }
  }, [addToast])

  const loadInstructors = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAdminInstructors({
        status: status || undefined,
        city: city || undefined,
        page,
      })
      setInstructors(data.results)
      setCount(data.count)
      setNext(data.next)
      setPrevious(data.previous)
    } catch {
      addToast('Помилка завантаження інструкторів', 'error')
    } finally {
      setLoading(false)
    }
  }, [addToast, city, page, status])

  useEffect(() => {
    loadStats()
    loadCities()
  }, [loadCities, loadStats])

  useEffect(() => {
    loadInstructors()
  }, [loadInstructors])

  const setStatusFilter = (value: InstructorStatus) => {
    setPage(1)
    setStatus(value)
  }

  const setCityFilter = (value: string) => {
    setPage(1)
    setCity(value)
  }

  const refreshData = async () => {
    await Promise.all([loadStats(), loadInstructors()])
  }

  const handleVerify = async (instructor: InstructorAdmin) => {
    setActionId(instructor.id)
    try {
      await verifyInstructor(instructor.id)
      addToast('Інструктора підтверджено', 'success')
      await refreshData()
    } catch {
      addToast('Помилка підтвердження інструктора', 'error')
    } finally {
      setActionId(null)
    }
  }

  const handleReject = async (note: string) => {
    if (!rejecting) return
    setActionId(rejecting.id)
    try {
      await rejectInstructor(rejecting.id, note)
      addToast('Заявку відхилено', 'success')
      setRejecting(null)
      await refreshData()
    } catch {
      addToast('Помилка відхилення заявки', 'error')
    } finally {
      setActionId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    setActionId(deleting.id)
    try {
      await deleteInstructor(deleting.id)
      addToast('Інструктора видалено', 'success')
      setDeleting(null)
      await refreshData()
    } catch {
      addToast('Помилка видалення інструктора', 'error')
    } finally {
      setActionId(null)
    }
  }

  const tabs: Array<{ value: InstructorStatus; label: string; count: number }> = [
    { value: 'pending', label: 'На верифікації', count: stats?.pending ?? 0 },
    { value: 'verified', label: 'Активні', count: stats?.verified ?? 0 },
    { value: '', label: 'Всі', count: stats?.total ?? 0 },
  ]
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE))

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Інструктори</h1>
          <p className="text-sm text-base-content/60 mt-1">
            Перевірка заявок та керування профілями інструкторів
          </p>
        </div>
        <select
          className="select select-bordered select-sm w-full sm:w-56"
          value={city}
          onChange={(event) => setCityFilter(event.target.value)}
        >
          <option value="">Всі міста</option>
          {cities.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card bg-base-100 border border-base-300/60 p-4">
          <Users className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-bold">{stats?.total ?? 0}</p>
          <p className="text-xs text-base-content/50">Всього</p>
        </div>
        <div className="card bg-base-100 border border-base-300/60 p-4">
          <Clock className="w-5 h-5 text-warning mb-2" />
          <p className="text-2xl font-bold">{stats?.pending ?? 0}</p>
          <p className="text-xs text-base-content/50">На верифікації</p>
        </div>
        <div className="card bg-base-100 border border-base-300/60 p-4">
          <BadgeCheck className="w-5 h-5 text-success mb-2" />
          <p className="text-2xl font-bold">{stats?.verified ?? 0}</p>
          <p className="text-xs text-base-content/50">Підтверджено</p>
        </div>
        <div className="card bg-base-100 border border-base-300/60 p-4">
          <GraduationCap className="w-5 h-5 text-info mb-2" />
          <p className="text-2xl font-bold">{stats?.with_active_subscription ?? 0}</p>
          <p className="text-xs text-base-content/50">З підпискою</p>
        </div>
      </div>

      <div className="tabs tabs-boxed w-fit mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            type="button"
            className={`tab gap-2 ${status === tab.value ? 'tab-active' : ''}`}
            onClick={() => setStatusFilter(tab.value)}
          >
            {tab.label}
            <span className="badge badge-sm">{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="card bg-base-100 border border-base-300/60 overflow-x-auto">
        <table className="table table-sm [&_td]:py-3">
          <thead>
            <tr>
              <th>Інструктор</th>
              <th>Місто</th>
              <th>Телефон</th>
              <th>Статус</th>
              <th>Дата</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <span className="loading loading-spinner loading-md" />
                </td>
              </tr>
            ) : instructors.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-base-content/50">
                  <GraduationCap className="w-8 h-8 mx-auto text-base-content/20 mb-2" />
                  Інструкторів не знайдено
                </td>
              </tr>
            ) : (
              instructors.map((instructor) => (
                <InstructorRow
                  key={instructor.id}
                  instructor={instructor}
                  actionId={actionId}
                  onVerify={handleVerify}
                  onReject={setRejecting}
                  onDelete={setDeleting}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {count > 0 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-base-content/50">
            Сторінка {page} з {totalPages}, всього {count}
          </p>
          <div className="join">
            <button
              type="button"
              className="join-item btn btn-sm"
              disabled={!previous}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="join-item btn btn-sm"
              disabled={!next}
              onClick={() => setPage((current) => current + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <RejectNoteModal
        open={!!rejecting}
        instructorName={rejecting ? instructorName(rejecting) : ''}
        saving={actionId === rejecting?.id}
        onClose={() => setRejecting(null)}
        onConfirm={handleReject}
      />
      <DeleteConfirmModal
        open={!!deleting}
        instructorName={deleting ? instructorName(deleting) : ''}
        saving={actionId === deleting?.id}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
