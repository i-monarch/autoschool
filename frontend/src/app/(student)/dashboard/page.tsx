'use client'

import { useEffect, useState } from 'react'
import {
  ClipboardCheck, BookOpen, Bookmark, Trophy, FileText, MapPin,
  ArrowRight, AlertTriangle, CheckCircle, XCircle,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import Link from 'next/link'
import api from '@/lib/api'

interface CategoryStat {
  category_id: number
  category_name: string
  attempts: number
  correct: number
  wrong: number
  total: number
  percent: number
}

interface Stats {
  total_attempts: number
  total_correct: number
  total_wrong: number
  total_questions: number
  avg_percent: number
  passed_count: number
  failed_count: number
  by_category: CategoryStat[]
}

interface Attempt {
  id: number
  test_type: 'exam' | 'topic' | 'marathon'
  category_name: string | null
  started_at: string
  finished_at: string
  score: number
  total: number
  is_passed: boolean
  percent: number
}

const TEST_TYPE_LABELS: Record<string, string> = {
  exam: 'Екзамен',
  topic: 'По темах',
  marathon: 'Марафон',
}

function formatDateUk(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatCurrentDate(): string {
  return new Date().toLocaleDateString('uk-UA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const isPaid = user?.is_paid ?? false
  const [stats, setStats] = useState<Stats | null>(null)
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/tests/stats/').then(r => r.data).catch(() => null),
      api.get('/tests/attempts/').then(r => r.data).catch(() => []),
    ]).then(([st, att]) => {
      setStats(st)
      setAttempts(att)
    }).finally(() => setLoading(false))
  }, [])

  const recentAttempts = attempts.slice(0, 5)
  const weakCategories = stats?.by_category.filter(c => c.percent < 80) ?? []

  return (
    <div>
      {/* Welcome banner with road illustration */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/90 via-primary to-emerald-600 text-primary-content mb-8">
        {/* Road SVG decoration */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <svg className="absolute bottom-0 right-0 w-[420px] h-full opacity-10" viewBox="0 0 420 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Road */}
            <path d="M420 140 L280 140 Q240 140 220 120 L140 40 Q120 20 80 20 L0 20" stroke="white" strokeWidth="60" strokeLinecap="round" />
            {/* Center dashes */}
            <path d="M420 140 L280 140 Q240 140 220 120 L140 40 Q120 20 80 20 L0 20" stroke="white" strokeWidth="3" strokeDasharray="12 10" opacity="0.6" fill="none" />
          </svg>
          {/* Car silhouette */}
          <svg className="absolute bottom-6 right-16 w-20 h-12 opacity-20" viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 32 L10 24 Q10 20 14 18 L24 12 Q28 8 34 8 L52 8 Q56 8 60 12 L68 20 Q72 24 72 28 L72 32" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="22" cy="36" r="6" stroke="white" strokeWidth="2.5" fill="none" />
            <circle cx="60" cy="36" r="6" stroke="white" strokeWidth="2.5" fill="none" />
            <line x1="30" y1="8" x2="32" y2="18" stroke="white" strokeWidth="2" opacity="0.5" />
            <line x1="50" y1="8" x2="48" y2="18" stroke="white" strokeWidth="2" opacity="0.5" />
          </svg>
          {/* Traffic light */}
          <svg className="absolute top-4 right-56 w-8 h-20 opacity-15" viewBox="0 0 24 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="0" width="16" height="45" rx="4" stroke="white" strokeWidth="2" fill="none" />
            <circle cx="12" cy="12" r="5" fill="white" opacity="0.3" />
            <circle cx="12" cy="24" r="5" fill="white" opacity="0.3" />
            <circle cx="12" cy="36" r="5" fill="white" opacity="0.8" />
            <rect x="10" y="45" width="4" height="15" fill="white" opacity="0.3" />
          </svg>
        </div>

        <div className="relative px-6 py-7 sm:px-8 sm:py-8">
          <p className="text-primary-content/60 text-sm mb-1 capitalize">{formatCurrentDate()}</p>
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">
            Вітаємо, {user?.first_name || user?.username}!
          </h1>
          {stats && stats.total_attempts > 0 ? (
            <div className="flex items-center gap-3">
              <div className="flex-1 max-w-xs">
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-primary-content/70">Ваш прогрес</span>
                  <span className="font-semibold">{stats.avg_percent}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2.5">
                  <div
                    className="h-full bg-white rounded-full transition-all"
                    style={{ width: `${stats.avg_percent}%` }}
                  />
                </div>
              </div>
              <Link href="/tests/exam" className="btn btn-sm bg-white/20 border-white/30 text-white hover:bg-white/30">
                Почати тест
              </Link>
            </div>
          ) : (
            <Link href="/tests/exam" className="btn btn-sm bg-white/20 border-white/30 text-white hover:bg-white/30">
              Почати перший тест
            </Link>
          )}
        </div>
      </div>

      {/* Stats cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <StatCard
            label="Тестів пройдено"
            value={String(stats?.total_attempts ?? 0)}
            color="primary"
          />
          <StatCard
            label="Середній результат"
            value={`${stats?.avg_percent ?? 0}%`}
            color="info"
            progress={stats?.avg_percent}
          />
          <StatCard
            label="Правильних відповідей"
            value={String(stats?.total_correct ?? 0)}
            color="success"
          />
          <Link href="/tests" className="block">
            <StatCard
              label="Помилок"
              value={String(stats?.total_wrong ?? 0)}
              color="error"
              clickable
            />
          </Link>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Recent attempts */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Останні результати</h2>
            {attempts.length > 0 && (
              <Link href="/tests/history" className="text-sm text-primary hover:underline flex items-center gap-1">
                Переглянути всі
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="skeleton h-64 rounded-xl" />
          ) : recentAttempts.length === 0 ? (
            <div className="card bg-base-100 border border-base-300/60">
              <div className="card-body items-center text-center py-12">
                <ClipboardCheck className="w-12 h-12 text-base-content/20 mb-3" />
                <p className="text-base-content/50 mb-1">Ви ще не проходили тести</p>
                <p className="text-sm text-base-content/40 mb-4">Пройдіть перший тест, щоб побачити результати</p>
                <Link href="/tests/exam" className="btn btn-primary btn-sm">
                  Почати екзамен
                </Link>
              </div>
            </div>
          ) : (
            <div className="card bg-base-100 border border-base-300/60 overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Тип</th>
                    <th>Результат</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAttempts.map(a => (
                    <tr key={a.id} className="hover">
                      <td className="text-sm text-base-content/70">
                        {formatDateUk(a.finished_at || a.started_at)}
                      </td>
                      <td className="text-sm">{TEST_TYPE_LABELS[a.test_type] ?? a.test_type}</td>
                      <td className="text-sm font-medium">{a.score}/{a.total}</td>
                      <td>
                        {a.is_passed ? (
                          <span className="badge badge-success badge-sm gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Здано
                          </span>
                        ) : (
                          <span className="badge badge-error badge-sm gap-1">
                            <XCircle className="w-3 h-3" />
                            Не здано
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Швидкі дії</h2>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            <QuickAction
              href="/tests/exam"
              icon={<ClipboardCheck className="w-5 h-5" />}
              label="Екзамен"
              color="error"
            />
            <QuickAction
              href="/theory"
              icon={<BookOpen className="w-5 h-5" />}
              label="Теорія"
              color="primary"
            />
            <QuickAction
              href="/tests"
              icon={<Bookmark className="w-5 h-5" />}
              label="Збережені питання"
              color="warning"
            />
            <QuickAction
              href="/tests/leaderboard"
              icon={<Trophy className="w-5 h-5" />}
              label="Рейтинг"
              color="accent"
            />
            <QuickAction
              href="/europrotocol"
              icon={<FileText className="w-5 h-5" />}
              label="Європротокол"
              color="info"
            />
            <QuickAction
              href="/routes"
              icon={<MapPin className="w-5 h-5" />}
              label="Маршрути"
              color="success"
            />
          </div>
        </div>
      </div>

      {/* Weak categories */}
      {!loading && weakCategories.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <h2 className="text-lg font-semibold">Слабкі теми</h2>
            <span className="text-xs text-base-content/40">менше 80% правильних</span>
          </div>
          <div className="space-y-2">
            {weakCategories.map(cat => (
              <div
                key={cat.category_id}
                className="card bg-base-100 border border-base-300/60 p-4"
              >
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span className="text-sm font-medium truncate">{cat.category_name}</span>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-sm font-semibold ${
                      cat.percent < 50 ? 'text-error' : cat.percent < 70 ? 'text-warning' : 'text-base-content/70'
                    }`}>
                      {cat.percent}%
                    </span>
                    <Link
                      href={`/tests/topic/${cat.category_id}`}
                      className="btn btn-primary btn-xs"
                    >
                      Пройти тест
                    </Link>
                  </div>
                </div>
                <progress
                  className={`progress w-full h-2 ${
                    cat.percent < 50 ? 'progress-error' : cat.percent < 70 ? 'progress-warning' : 'progress-primary'
                  }`}
                  value={cat.percent}
                  max={100}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  color,
  progress,
  clickable,
}: {
  label: string
  value: string
  color: string
  progress?: number
  clickable?: boolean
}) {
  return (
    <div className={`card bg-base-100 border border-base-300/60 p-4 ${
      clickable ? 'hover:border-error/40 hover:shadow-sm transition-all cursor-pointer' : ''
    }`}>
      <p className={`text-2xl sm:text-3xl font-bold text-${color}`}>{value}</p>
      <p className="text-xs sm:text-sm text-base-content/50 mt-1">{label}</p>
      {typeof progress === 'number' && (
        <progress className={`progress progress-${color} w-full mt-2 h-1.5`} value={progress} max={100} />
      )}
    </div>
  )
}

function QuickAction({
  href,
  icon,
  label,
  color,
}: {
  href: string
  icon: React.ReactNode
  label: string
  color: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 rounded-xl border border-base-300/60 bg-base-100 hover:border-primary/30 hover:bg-primary/5 transition-colors group"
    >
      <div className={`w-10 h-10 rounded-lg bg-${color}/10 text-${color} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
      <ArrowRight className="w-4 h-4 text-base-content/20 ml-auto group-hover:text-primary/60 transition-colors" />
    </Link>
  )
}
