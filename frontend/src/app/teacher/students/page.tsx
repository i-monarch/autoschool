'use client'

import { useEffect, useState, useCallback } from 'react'
import { Users, Search, ChevronLeft, ChevronRight, ArrowUpDown, Eye } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'

interface Student {
  id: number
  username: string
  full_name: string
  email: string
  phone: string | null
  access_type: string
  is_paid: boolean
  created_at: string
  last_login: string | null
  tests_count: number
  tests_passed: number
}

const ACCESS_LABELS: Record<string, { text: string; cls: string }> = {
  free: { text: 'Безкоштовний', cls: 'badge-ghost' },
  trial: { text: 'Пробний', cls: 'badge-warning' },
  paid: { text: 'Оплачений', cls: 'badge-success' },
}

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [accessFilter, setAccessFilter] = useState('')
  const [ordering, setOrdering] = useState('-created_at')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), ordering })
      if (search) params.set('search', search)
      if (accessFilter) params.set('access', accessFilter)
      const r = await api.get(`/teacher/students/?${params}`)
      setStudents(r.data.results || r.data)
      if (r.data.count) {
        setTotalPages(Math.ceil(r.data.count / 20))
      }
    } catch { /* ignore */ }
    setLoading(false)
  }, [page, search, accessFilter, ordering])

  useEffect(() => { fetchStudents() }, [fetchStudents])

  useEffect(() => { setPage(1) }, [search, accessFilter, ordering])

  const toggleOrder = (field: string) => {
    setOrdering(prev => prev === field ? `-${field}` : prev === `-${field}` ? field : `-${field}`)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Учні</h1>
          <p className="text-base-content/60 text-sm mt-1">Список учнів та їх прогрес</p>
        </div>
        <div className="flex gap-2">
          <select
            className="select select-bordered select-sm"
            value={accessFilter}
            onChange={(e) => setAccessFilter(e.target.value)}
          >
            <option value="">Всі</option>
            <option value="free">Безкоштовні</option>
            <option value="trial">Пробні</option>
            <option value="paid">Оплачені</option>
          </select>
          <div className="join">
            <div className="join-item flex items-center pl-3 bg-base-100 border border-base-300/60 border-r-0">
              <Search className="w-4 h-4 text-base-content/40" />
            </div>
            <input
              type="text"
              placeholder="Пошук..."
              className="input input-bordered join-item input-sm w-full sm:w-44 border-l-0 focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="skeleton h-96 rounded-xl" />
      ) : students.length === 0 ? (
        <div className="card bg-base-100 border border-base-300/60">
          <div className="card-body items-center text-center py-16">
            <Users className="w-12 h-12 text-base-content/20 mb-3" />
            <h3 className="font-semibold text-lg mb-1">
              {search || accessFilter ? 'Нічого не знайдено' : 'Поки немає учнів'}
            </h3>
          </div>
        </div>
      ) : (
        <>
          <div className="card bg-base-100 border border-base-300/60 overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>
                    <button onClick={() => toggleOrder('first_name')} className="flex items-center gap-1 hover:text-secondary">
                      Учень <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th>Доступ</th>
                  <th>
                    <button onClick={() => toggleOrder('tests_count')} className="flex items-center gap-1 hover:text-secondary">
                      Тести <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th>Здано</th>
                  <th>
                    <button onClick={() => toggleOrder('last_login')} className="flex items-center gap-1 hover:text-secondary">
                      Останній вхід <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id} className="hover">
                    <td>
                      <div>
                        <p className="text-sm font-medium">{s.full_name}</p>
                        <p className="text-xs text-base-content/40">{s.email}</p>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-sm ${ACCESS_LABELS[s.access_type]?.cls || ''}`}>
                        {ACCESS_LABELS[s.access_type]?.text || s.access_type}
                      </span>
                    </td>
                    <td className="text-sm tabular-nums">{s.tests_count}</td>
                    <td className="text-sm tabular-nums">{s.tests_passed}</td>
                    <td className="text-xs text-base-content/50">
                      {s.last_login
                        ? new Date(s.last_login).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })
                        : '-'}
                    </td>
                    <td>
                      <Link href={`/teacher/students/${s.id}`} className="btn btn-ghost btn-xs btn-circle">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              <button
                className="btn btn-sm btn-ghost"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="btn btn-sm btn-ghost pointer-events-none">
                {page} / {totalPages}
              </span>
              <button
                className="btn btn-sm btn-ghost"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
