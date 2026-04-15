'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Search, Users, ChevronLeft, ChevronRight,
  CheckCircle, Clock, XCircle, CreditCard,
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
  access_type: 'free' | 'trial' | 'paid'
  is_active: boolean
  created_at: string
  tests_count: number
}

interface Stats {
  total: number
  active: number
  paid: number
  trial: number
  free: number
}

interface PaginatedResponse {
  count: number
  results: Student[]
}

const ACCESS_CONFIG = {
  paid: { label: 'Оплачено', bg: 'bg-success/10 text-success' },
  trial: { label: 'Пробний', bg: 'bg-warning/10 text-warning' },
  free: { label: 'Безкоштовний', bg: 'bg-base-200 text-base-content/60' },
} as const

export default function AdminStudentsPage() {
  const toast = useToast()

  const [stats, setStats] = useState<Stats | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [totalStudents, setTotalStudents] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [accessFilter, setAccessFilter] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<number | null>(null)

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
      if (accessFilter) params.access = accessFilter
      const { data } = await api.get<PaginatedResponse>('/admin/students/', { params })
      setStudents(data.results)
      setTotalStudents(data.count)
    } catch {
      toast.add('Помилка завантаження учнів', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, search, accessFilter, toast])

  useEffect(() => { fetchStats() }, [])
  useEffect(() => { fetchStudents() }, [page, search, accessFilter])
  useEffect(() => { setPage(1) }, [search, accessFilter])

  const setAccess = async (student: Student, accessType: 'free' | 'trial' | 'paid') => {
    setActionId(student.id)
    try {
      await api.post(`/admin/students/${student.id}/payment/`, {
        access_type: accessType,
        paid_until: null,
      })
      const labels = { free: 'безкоштовний', trial: 'пробний', paid: 'оплачений' }
      toast.add(`${student.full_name} — ${labels[accessType]} доступ`, 'success')
      fetchStudents()
      fetchStats()
    } catch {
      toast.add('Помилка зміни доступу', 'error')
    } finally {
      setActionId(null)
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
            {stats ? `${stats.total} учнів` : 'Завантаження...'}
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
          <p className="text-2xl font-bold text-warning">{stats?.trial ?? 0}</p>
          <p className="text-xs text-base-content/50">Пробний</p>
        </div>
        <div className="card bg-base-100 border border-base-300/60 p-4">
          <p className="text-2xl font-bold text-base-content/40">{stats?.free ?? 0}</p>
          <p className="text-xs text-base-content/50">Безкоштовний</p>
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
          value={accessFilter}
          onChange={e => setAccessFilter(e.target.value)}
        >
          <option value="">Всі статуси</option>
          <option value="paid">Оплачено</option>
          <option value="trial">Пробний</option>
          <option value="free">Безкоштовний</option>
        </select>
      </div>

      {/* Table */}
      <div className="card bg-base-100 border border-base-300/60">
        <table className="table table-sm [&_td]:py-3">
          <thead>
            <tr>
              <th>Учень</th>
              <th className="hidden sm:table-cell">Email</th>
              <th className="hidden md:table-cell">Телефон</th>
              <th className="text-center">Доступ</th>
              <th className="hidden lg:table-cell text-center">Тести</th>
              <th className="hidden lg:table-cell">Реєстрація</th>
              <th></th>
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
                  {search || accessFilter ? 'Нічого не знайдено' : 'Немає учнів'}
                </td>
              </tr>
            ) : (
              students.map(s => {
                const config = ACCESS_CONFIG[s.access_type] || ACCESS_CONFIG.free
                return (
                  <tr key={s.id} className="hover">
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar placeholder flex-shrink-0">
                          <div className="bg-neutral text-neutral-content rounded-full w-8">
                            <span className="text-xs">
                              {(s.first_name?.[0] || s.username[0]).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <span className="font-medium text-sm">{s.full_name}</span>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell text-sm text-base-content/60">
                      {s.email}
                    </td>
                    <td className="hidden md:table-cell text-sm text-base-content/60">
                      {s.phone || '—'}
                    </td>
                    <td className="text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${config.bg}`}>
                        {config.label}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell text-center text-sm">
                      {s.tests_count}
                    </td>
                    <td className="hidden lg:table-cell text-sm text-base-content/60">
                      {formatDate(s.created_at)}
                    </td>
                    <td>
                      <div className="dropdown dropdown-end">
                        <label tabIndex={0} className="btn btn-xs btn-outline gap-1">
                          <CreditCard className="w-3 h-3" />
                          {actionId === s.id ? (
                            <span className="loading loading-spinner loading-xs" />
                          ) : (
                            'Доступ'
                          )}
                        </label>
                        <ul tabIndex={0} className="dropdown-content z-10 menu p-1.5 shadow-lg bg-base-100 border border-base-300/60 rounded-box w-40">
                          <li>
                            <button
                              onClick={() => setAccess(s, 'paid')}
                              className={`text-sm ${s.access_type === 'paid' ? 'active' : ''}`}
                            >
                              <CheckCircle className="w-3.5 h-3.5 text-success" />
                              Оплачений
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={() => setAccess(s, 'trial')}
                              className={`text-sm ${s.access_type === 'trial' ? 'active' : ''}`}
                            >
                              <Clock className="w-3.5 h-3.5 text-warning" />
                              Пробний
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={() => setAccess(s, 'free')}
                              className={`text-sm ${s.access_type === 'free' ? 'active' : ''}`}
                            >
                              <XCircle className="w-3.5 h-3.5 text-base-content/40" />
                              Безкоштовний
                            </button>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
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
