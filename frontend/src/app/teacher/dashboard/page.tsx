'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, CheckCircle, XCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import Link from 'next/link'
import api from '@/lib/api'

interface DashboardData {
  stats: {
    total_students: number
    paid_students: number
    new_messages_today: number
    tests_today: number
    weekly_tests: number
    weekly_active_students: number
    avg_score: number
  }
  recent_results: Array<{
    student_name: string
    test_type: string
    category_name: string | null
    score: number
    total: number
    is_passed: boolean
    finished_at: string
  }>
  weak_categories: Array<{
    category_name: string
    percent: number
    attempts: number
  }>
}

const TEST_TYPE_LABELS: Record<string, string> = {
  exam: 'Екзамен', topic: 'По темах', marathon: 'Марафон',
}

export default function TeacherDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/teacher/dashboard/')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">
          Привіт, {user?.first_name || user?.username}
        </h1>
        <p className="text-sm text-base-content/50">Панель викладача</p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
      ) : data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="rounded-xl border border-base-300/60 bg-base-100 p-4">
            <p className="text-sm text-base-content/50 mb-1">Учні</p>
            <p className="text-2xl font-bold">{data.stats.total_students}</p>
            <p className="text-sm text-base-content/40">{data.stats.paid_students} оплачених</p>
          </div>
          <div className="rounded-xl border border-base-300/60 bg-base-100 p-4">
            <p className="text-sm text-base-content/50 mb-1">Тести сьогодні</p>
            <p className="text-2xl font-bold">{data.stats.tests_today}</p>
            <p className="text-sm text-base-content/40">{data.stats.weekly_tests} за тиждень</p>
          </div>
          <div className="rounded-xl border border-base-300/60 bg-base-100 p-4">
            <p className="text-sm text-base-content/50 mb-1">Повідомлення</p>
            <p className="text-2xl font-bold">{data.stats.new_messages_today}</p>
            <p className="text-sm text-base-content/40">нових сьогодні</p>
          </div>
          <div className="rounded-xl border border-base-300/60 bg-base-100 p-4">
            <p className="text-sm text-base-content/50 mb-1">Середній бал</p>
            <p className="text-2xl font-bold">{data.stats.avg_score}%</p>
            <p className="text-sm text-base-content/40">{data.stats.weekly_active_students} активних за тиждень</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent results */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Останні результати</h2>
            <Link href="/teacher/students" className="text-sm text-primary hover:underline">
              Всі учні
            </Link>
          </div>

          {loading ? (
            <div className="skeleton h-72 rounded-xl" />
          ) : !data || data.recent_results.length === 0 ? (
            <div className="card bg-base-100 border border-base-300/60 p-12 text-center">
              <p className="text-base-content/40">Ще немає результатів тестів</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.recent_results.map((r, i) => (
                <div key={i} className="flex items-center gap-4 p-3.5 rounded-xl bg-base-100 border border-base-300/60">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{r.student_name}</p>
                    <p className="text-xs text-base-content/40">
                      {TEST_TYPE_LABELS[r.test_type] ?? r.test_type}
                      {r.category_name ? ` / ${r.category_name}` : ''}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold tabular-nums">{r.score}/{r.total}</p>
                    <p className="text-xs text-base-content/40">
                      {new Date(r.finished_at).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  {r.is_passed ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-success/10 text-success flex-shrink-0">
                      <CheckCircle className="w-3 h-3" />Здано
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-error/10 text-error flex-shrink-0">
                      <XCircle className="w-3 h-3" />Не здано
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Weak categories */}
          {!loading && data && data.weak_categories.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Слабкі теми учнів</h2>
              <div className="space-y-2">
                {data.weak_categories.slice(0, 5).map((cat, i) => (
                  <div key={i} className="p-3 rounded-xl bg-base-100 border border-base-300/60">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm truncate">{cat.category_name}</span>
                      <span className={`text-sm font-bold tabular-nums ${
                        cat.percent < 50 ? 'text-error' : cat.percent < 70 ? 'text-warning' : 'text-base-content/60'
                      }`}>{cat.percent}%</span>
                    </div>
                    <div className="w-full bg-base-200 rounded-full h-1.5">
                      <div
                        className={`h-full rounded-full transition-all ${
                          cat.percent < 50 ? 'bg-error' : cat.percent < 70 ? 'bg-warning' : 'bg-primary'
                        }`}
                        style={{ width: `${cat.percent}%` }}
                      />
                    </div>
                    <p className="text-xs text-base-content/40 mt-1">{cat.attempts} спроб</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick links */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Швидкий доступ</h2>
            <div className="space-y-1.5">
              <Link href="/teacher/schedule" className="flex items-center justify-between p-3.5 rounded-xl bg-base-100 border border-base-300/60 hover:border-primary/30 transition-colors text-sm font-medium">
                Розклад занять
                <ArrowRight className="w-4 h-4 text-base-content/20" />
              </Link>
              <Link href="/teacher/chat" className="flex items-center justify-between p-3.5 rounded-xl bg-base-100 border border-base-300/60 hover:border-primary/30 transition-colors text-sm font-medium">
                Повідомлення
                <ArrowRight className="w-4 h-4 text-base-content/20" />
              </Link>
              <Link href="/teacher/students" className="flex items-center justify-between p-3.5 rounded-xl bg-base-100 border border-base-300/60 hover:border-primary/30 transition-colors text-sm font-medium">
                Список учнів
                <ArrowRight className="w-4 h-4 text-base-content/20" />
              </Link>
              <Link href="/teacher/profile" className="flex items-center justify-between p-3.5 rounded-xl bg-base-100 border border-base-300/60 hover:border-primary/30 transition-colors text-sm font-medium">
                Налаштування профілю
                <ArrowRight className="w-4 h-4 text-base-content/20" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
