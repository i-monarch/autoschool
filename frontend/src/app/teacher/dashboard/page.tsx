'use client'

import { useEffect, useState } from 'react'
import {
  Users, MessageCircle, ClipboardCheck, TrendingUp,
  ArrowRight, CheckCircle, XCircle, BarChart3,
} from 'lucide-react'
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
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 border border-indigo-200/60 mb-6">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <svg className="absolute bottom-0 right-0 w-[300px] h-full opacity-[0.06]" viewBox="0 0 300 120" fill="none">
            <rect x="20" y="30" width="80" height="60" rx="8" stroke="currentColor" strokeWidth="4" className="text-indigo-800" />
            <rect x="30" y="10" width="60" height="30" rx="6" stroke="currentColor" strokeWidth="3" className="text-indigo-800" />
            <circle cx="180" cy="60" r="30" stroke="currentColor" strokeWidth="4" className="text-indigo-800" />
            <path d="M165 60 L175 70 L195 50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-indigo-800" />
            <path d="M230 20 L270 20 M230 40 L260 40 M230 60 L270 60 M230 80 L250 80" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-indigo-800" />
          </svg>
        </div>
        <div className="relative px-6 py-6 sm:px-8 sm:py-7">
          <h1 className="text-2xl sm:text-3xl font-bold text-base-content mb-1">
            Привіт, {user?.first_name || user?.username}!
          </h1>
          <p className="text-base-content/60 text-sm">Панель викладача</p>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
      ) : data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard
            icon={<Users className="w-5 h-5" />}
            label="Всього учнів"
            value={String(data.stats.total_students)}
            sub={`${data.stats.paid_students} оплачених`}
            color="secondary"
          />
          <StatCard
            icon={<ClipboardCheck className="w-5 h-5" />}
            label="Тестів сьогодні"
            value={String(data.stats.tests_today)}
            sub={`${data.stats.weekly_tests} за тиждень`}
            color="primary"
          />
          <StatCard
            icon={<MessageCircle className="w-5 h-5" />}
            label="Повідомлень"
            value={String(data.stats.new_messages_today)}
            sub="нових сьогодні"
            color="info"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Середній бал"
            value={`${data.stats.avg_score}%`}
            sub={`${data.stats.weekly_active_students} активних за тиждень`}
            color="success"
          />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent results */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Останні результати учнів</h2>
            <Link href="/teacher/students" className="text-sm text-secondary hover:underline flex items-center gap-1">
              Всі учні <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="skeleton h-72 rounded-xl" />
          ) : !data || data.recent_results.length === 0 ? (
            <div className="card bg-base-100 border border-base-300/60">
              <div className="card-body items-center text-center py-12">
                <ClipboardCheck className="w-12 h-12 text-base-content/20 mb-3" />
                <p className="text-base-content/50">Ще немає результатів</p>
              </div>
            </div>
          ) : (
            <div className="card bg-base-100 border border-base-300/60 overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Учень</th>
                    <th>Тип</th>
                    <th>Результат</th>
                    <th>Статус</th>
                    <th>Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_results.map((r, i) => (
                    <tr key={i} className="hover">
                      <td className="text-sm font-medium">{r.student_name}</td>
                      <td className="text-sm text-base-content/70">{TEST_TYPE_LABELS[r.test_type] ?? r.test_type}</td>
                      <td className="text-sm font-medium">{r.score}/{r.total}</td>
                      <td>
                        {r.is_passed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-success/10 text-success"><CheckCircle className="w-3 h-3" />Здано</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-error/10 text-error"><XCircle className="w-3 h-3" />Не здано</span>
                        )}
                      </td>
                      <td className="text-xs text-base-content/50">
                        {new Date(r.finished_at).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Weak categories */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-warning" />
            <h2 className="text-lg font-semibold">Слабкі теми</h2>
          </div>

          {loading ? (
            <div className="skeleton h-48 rounded-xl" />
          ) : !data || data.weak_categories.length === 0 ? (
            <div className="card bg-base-100 border border-base-300/60 p-6 text-center">
              <p className="text-sm text-base-content/50">Поки немає даних</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.weak_categories.map((cat, i) => (
                <div key={i} className="card bg-base-100 border border-base-300/60 p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium truncate">{cat.category_name}</span>
                    <span className={`text-sm font-semibold ${
                      cat.percent < 50 ? 'text-error' : cat.percent < 70 ? 'text-warning' : 'text-base-content/70'
                    }`}>{cat.percent}%</span>
                  </div>
                  <progress
                    className={`progress w-full h-2 ${
                      cat.percent < 50 ? 'progress-error' : cat.percent < 70 ? 'progress-warning' : 'progress-primary'
                    }`}
                    value={cat.percent} max={100}
                  />
                  <p className="text-[10px] text-base-content/40 mt-1">{cat.attempts} спроб</p>
                </div>
              ))}
            </div>
          )}

          {/* Quick links */}
          <div className="mt-6 space-y-2">
            <Link href="/teacher/chat" className="flex items-center gap-3 p-3 rounded-xl border border-base-300/60 bg-base-100 hover:border-secondary/30 hover:bg-secondary/5 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-info/10 text-info flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Повідомлення</span>
              <ArrowRight className="w-4 h-4 text-base-content/20 ml-auto group-hover:text-secondary/60" />
            </Link>
            <Link href="/teacher/students" className="flex items-center gap-3 p-3 rounded-xl border border-base-300/60 bg-base-100 hover:border-secondary/30 hover:bg-secondary/5 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Список учнів</span>
              <ArrowRight className="w-4 h-4 text-base-content/20 ml-auto group-hover:text-secondary/60" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string; sub: string; color: string
}) {
  return (
    <div className="card bg-base-100 border border-base-300/60 p-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-${color}/10 text-${color}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-base-content/50 mt-0.5">{label}</p>
      <p className="text-[10px] text-base-content/40 mt-0.5">{sub}</p>
    </div>
  )
}
