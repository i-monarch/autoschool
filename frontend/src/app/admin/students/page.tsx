'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Search, Users, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, CreditCard,
} from 'lucide-react'
import api from '@/lib/api'
import { useToast } from '@/components/ui/Toast'

interface Student {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  phone: string | null
  is_paid: boolean
  paid_until: string | null
  is_active: boolean
  created_at: string
  tests_count: number
}

interface Stats {
  total: number
  active: number
  paid: number
  unpaid: number
}

interface PaginatedResponse {
  count: number
  results: Student[]
}

export default function AdminStudentsPage() {
  const toast = useToast()

  const [stats, setStats] = useState<Stats | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [totalStudents, setTotalStudents] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [paidFilter, setPaidFilter] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const pageSize = 30

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get<Stats>('/admin/students/stats/')
      setStats(data)
    } catch {
      toast.add('Помилка завантаження статистики', 'error')
    }
  }, [toast])

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page, page_size: pageSize }
      if (search) params.search = search
      if (paidFilter) params.paid = paidFilter
      const { data } = await api.get<PaginatedResponse>('/admin/students/', { params })
      setStudents(data.results)
      setTotalStudents(data.count)
    } catch {
      toast.add('Помилка завантаження учнів', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, search, paidFilter, toast])

  useEffect(() => { fetchStats() }, [])
  useEffect(() => { fetchStudents() }, [page, search, paidFilter])
  useEffect(() => { setPage(1) }, [search, paidFilter])

  const togglePayment = async (student: Student) => {
    setTogglingId(student.id)
    try {
      await api.post(`/admin/students/${student.id}/payment/`, {
        is_paid: !student.is_paid,
        paid_until: null,
      })
      toast.add(
        !student.is_paid ? `${student.full_name} — оплату підтверджено` : `${student.full_name} — оплату скасовано`,
        'success'
      )
      fetchStudents()
      fetchStats()
    } catch {
      toast.add('Помилка зміни статусу', 'error')
    } finally {
      setTogglingId(null)
    }
  }

  const totalPages = Math.ceil(totalStudents / pageSize)

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Учні</h1>
          <p className="text-base-content/60 text-sm mt-1">
            {stats ? `${stats.total} учнів, ${stats.paid} оплачено` : 'Завантаження...'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="card bg-base-100 border border-base-300/60 p-4">
          <p className="text-2xl font-bold">{stats?.total ?? 0}</p>
          <p className="text-xs text-base-content/50">Всього</p>
        </div>
        <div className="card bg-base-100 border border-base-300/60 p-4">
          <p className="text-2xl font-bold text-success">{stats?.paid ?? 0}</p>
          <p className="text-xs text-base-content/50">Оплачено</p>
        </div>
        <div className="card bg-base-100 border border-base-300/60 p-4">
          <p className="text-2xl font-bold text-warning">{stats?.unpaid ?? 0}</p>
          <p className="text-xs text-base-content/50">Без оплати</p>
        </div>
        <div className="card bg-base-100 border border-base-300/60 p-4">
          <p className="text-2xl font-bold text-info">{stats?.active ?? 0}</p>
          <p className="text-xs text-base-content/50">Активних</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Пошук за ім'ям, email або телефоном..."
            className="input input-bordered input-sm w-full pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="select select-bordered select-sm"
          value={paidFilter}
          onChange={e => setPaidFilter(e.target.value)}
        >
          <option value="">Всі статуси</option>
          <option value="true">Оплачено</option>
          <option value="false">Без оплати</option>
        </select>
      </div>

      {/* Table */}
      <div className="card bg-base-100 border border-base-300/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Учень</th>
                <th className="hidden sm:table-cell">Email</th>
                <th className="hidden md:table-cell">Телефон</th>
                <th className="text-center">Оплата</th>
                <th className="hidden lg:table-cell text-center">Тестів</th>
                <th className="hidden lg:table-cell">Реєстрація</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <span className="loading loading-spinner loading-md" />
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-base-content/50">
                    <Users className="w-8 h-8 mx-auto text-base-content/20 mb-2" />
                    {search || paidFilter ? 'Нічого не знайдено' : 'Немає учнів'}
                  </td>
                </tr>
              ) : (
                students.map(s => (
                  <tr key={s.id} className="hover">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-neutral text-neutral-content rounded-full w-8">
                            <span className="text-xs">
                              {(s.first_name?.[0] || s.username[0]).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{s.full_name}</p>
                          <p className="text-xs text-base-content/50 sm:hidden">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell text-sm">{s.email}</td>
                    <td className="hidden md:table-cell text-sm text-base-content/60">
                      {s.phone || '—'}
                    </td>
                    <td className="text-center">
                      {s.is_paid ? (
                        <span className="badge badge-success badge-sm gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Оплачено
                        </span>
                      ) : (
                        <span className="badge badge-ghost badge-sm gap-1">
                          <XCircle className="w-3 h-3" />
                          Ні
                        </span>
                      )}
                    </td>
                    <td className="hidden lg:table-cell text-center text-sm">
                      {s.tests_count}
                    </td>
                    <td className="hidden lg:table-cell text-sm text-base-content/60">
                      {formatDate(s.created_at)}
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm gap-2 whitespace-nowrap ${s.is_paid ? 'btn-outline btn-error' : 'btn-success'}`}
                        onClick={() => togglePayment(s)}
                        disabled={togglingId === s.id}
                      >
                        {togglingId === s.id ? (
                          <span className="loading loading-spinner loading-xs" />
                        ) : (
                          <CreditCard className="w-4 h-4" />
                        )}
                        {s.is_paid ? 'Скасувати' : 'Оплатити'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-base-content/50">
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalStudents)} з {totalStudents}
          </p>
          <div className="join">
            <button
              className="join-item btn btn-sm"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="join-item btn btn-sm btn-disabled">
              {page} / {totalPages}
            </button>
            <button
              className="join-item btn btn-sm"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
