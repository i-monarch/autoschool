'use client'

import { useEffect, useState } from 'react'
import {
  ClipboardCheck, BookOpen, Bookmark, Trophy, FileText, MapPin,
  ArrowRight, AlertTriangle, CheckCircle, XCircle, ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import Link from 'next/link'
import api from '@/lib/api'
import StreakCard from '@/components/dashboard/StreakCard'
import DailyGoalRing from '@/components/dashboard/DailyGoalRing'
import XPLevelBar from '@/components/dashboard/XPLevelBar'
import WeeklyActivity from '@/components/dashboard/WeeklyActivity'
import AchievementsList from '@/components/dashboard/AchievementsList'

interface CategoryStat {
  category_id: number
  category_name: string
  percent: number
}

interface Stats {
  total_attempts: number
  total_correct: number
  total_wrong: number
  total_questions: number
  avg_percent: number
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
}

interface MotivationData {
  streak: { current_streak: number; longest_streak: number; last_activity_date: string | null; total_study_days: number }
  xp: { total_xp: number; level: number; xp_for_next_level: number; xp_in_current_level: number }
  daily_goal: { target: number; current: number; completed: boolean }
  today: { questions_answered: number; correct_answers: number; xp_earned: number }
  weekly: Array<{ date: string; day: string; questions: number; correct: number; xp: number; active: boolean }>
  achievements: { earned: number; total: number; recent: Array<{ code: string; name: string; icon: string; earned_at: string }> }
}

const TEST_TYPE_LABELS: Record<string, string> = {
  exam: 'Екзамен', topic: 'По темах', marathon: 'Марафон',
}

function formatDateUk(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatCurrentDate(): string {
  return new Date().toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const [stats, setStats] = useState<Stats | null>(null)
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [motivation, setMotivation] = useState<MotivationData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = () => {
    Promise.all([
      api.get('/tests/stats/').then(r => r.data).catch(() => null),
      api.get('/tests/attempts/').then(r => r.data).catch(() => []),
      api.get('/motivation/dashboard/').then(r => r.data).catch(() => null),
    ]).then(([st, att, mot]) => {
      setStats(st)
      setAttempts(att)
      setMotivation(mot)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const recentAttempts = attempts.slice(0, 5)
  const weakCategories = stats?.by_category.filter(c => c.percent < 80) ?? []

  return (
    <div>
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border border-emerald-200/60 mb-6">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <svg className="absolute bottom-0 right-0 w-[420px] h-full opacity-[0.06]" viewBox="0 0 420 160" fill="none">
            <path d="M420 140 L280 140 Q240 140 220 120 L140 40 Q120 20 80 20 L0 20" stroke="currentColor" strokeWidth="60" strokeLinecap="round" className="text-emerald-800" />
            <path d="M420 140 L280 140 Q240 140 220 120 L140 40 Q120 20 80 20 L0 20" stroke="currentColor" strokeWidth="3" strokeDasharray="12 10" opacity="0.4" fill="none" className="text-emerald-600" />
          </svg>
        </div>
        <div className="relative px-6 py-6 sm:px-8 sm:py-7">
          <p className="text-emerald-600/60 text-sm mb-1 capitalize">{formatCurrentDate()}</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-base-content mb-3">
            Вітаємо, {user?.first_name || user?.username}!
          </h1>
          {stats && stats.total_attempts > 0 ? (
            <div className="flex items-center gap-3">
              <div className="flex-1 max-w-xs">
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-base-content/60">Ваш прогрес</span>
                  <span className="font-semibold text-emerald-700">{stats.avg_percent}%</span>
                </div>
                <div className="w-full bg-emerald-200/50 rounded-full h-2.5">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${stats.avg_percent}%` }} />
                </div>
              </div>
              <Link href="/tests/exam" className="btn btn-sm btn-primary">Почати тест</Link>
            </div>
          ) : (
            <Link href="/tests/exam" className="btn btn-sm btn-primary">Почати перший тест</Link>
          )}
        </div>
      </div>

      {/* Motivation row: Streak + Daily Goal + XP */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-36 rounded-xl" />)}
        </div>
      ) : motivation && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StreakCard streak={motivation.streak} />
          <DailyGoalRing goal={motivation.daily_goal} onUpdate={fetchData} />
          <XPLevelBar xp={motivation.xp} />
        </div>
      )}

      {/* Weekly Activity + Achievements */}
      {!loading && motivation && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <WeeklyActivity weekly={motivation.weekly} />
          <AchievementsList achievements={motivation.achievements} />
        </div>
      )}

      {/* Stats cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <StatCard label="Тестів пройдено" value={String(stats?.total_attempts ?? 0)} accent="bg-base-100 border-base-300/60" />
          <StatCard label="Середній результат" value={`${stats?.avg_percent ?? 0}%`} sub="правильних відповідей" accent="bg-base-100 border-base-300/60" />
          <StatCard label="Правильних" value={String(stats?.total_correct ?? 0)} accent="bg-base-100 border-base-300/60" />
          <StatCard label="Помилок" value={String(stats?.total_wrong ?? 0)} accent="bg-base-100 border-base-300/60" />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Recent attempts */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Останні результати</h2>
            {attempts.length > 0 && (
              <Link href="/tests/history" className="text-sm text-primary hover:underline flex items-center gap-1">
                Переглянути всі <ArrowRight className="w-3.5 h-3.5" />
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
                <Link href="/tests/exam" className="btn btn-primary btn-sm mt-3">Почати екзамен</Link>
              </div>
            </div>
          ) : (
            <div className="card bg-base-100 border border-base-300/60 overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr><th>Дата</th><th>Тип</th><th>Результат</th><th>Статус</th></tr>
                </thead>
                <tbody>
                  {recentAttempts.map(a => (
                    <tr key={a.id} className="hover">
                      <td className="text-sm text-base-content/70">{formatDateUk(a.finished_at || a.started_at)}</td>
                      <td className="text-sm">{TEST_TYPE_LABELS[a.test_type] ?? a.test_type}</td>
                      <td className="text-sm font-medium">{a.score}/{a.total}</td>
                      <td>
                        {a.is_passed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-success/10 text-success">
                            <CheckCircle className="w-3 h-3" />Здано
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-error/10 text-error">
                            <XCircle className="w-3 h-3" />Не здано
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
            <QuickAction href="/tests/exam" icon={<ClipboardCheck className="w-5 h-5" />} label="Екзамен" desc="20 питань, 20 хв" />
            <QuickAction href="/theory" icon={<BookOpen className="w-5 h-5" />} label="Теорія" desc="Конспекти ПДР" />
            <QuickAction href="/tests" icon={<Bookmark className="w-5 h-5" />} label="Тренування" desc="Тести по темах" />
            <QuickAction href="/tests/leaderboard" icon={<Trophy className="w-5 h-5" />} label="Рейтинг" desc="Таблиця лідерів" />
            <QuickAction href="/europrotocol" icon={<FileText className="w-5 h-5" />} label="Європротокол" desc="Онлайн-заповнення" />
            <QuickAction href="/routes" icon={<MapPin className="w-5 h-5" />} label="Маршрути" desc="Екзаменаційні маршрути" />
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
              <div key={cat.category_id} className="card bg-base-100 border border-base-300/60 p-4">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span className="text-sm font-medium truncate">{cat.category_name}</span>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-sm font-semibold ${
                      cat.percent < 50 ? 'text-error' : cat.percent < 70 ? 'text-warning' : 'text-base-content/70'
                    }`}>{cat.percent}%</span>
                    <Link href={`/tests/topic/${cat.category_id}`} className="btn btn-primary btn-xs">Пройти тест</Link>
                  </div>
                </div>
                <progress
                  className={`progress w-full h-2 ${
                    cat.percent < 50 ? 'progress-error' : cat.percent < 70 ? 'progress-warning' : 'progress-primary'
                  }`}
                  value={cat.percent} max={100}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, sub, accent }: {
  label: string; value: string; sub?: string; accent: string
}) {
  return (
    <div className={`rounded-xl border p-4 ${accent}`}>
      <p className="text-xs text-base-content/50 mb-1">{label}</p>
      <p className="text-2xl sm:text-3xl font-bold">{value}</p>
      {sub && <p className="text-xs text-base-content/40 mt-0.5">{sub}</p>}
    </div>
  )
}

function QuickAction({ href, icon, label, desc }: {
  href: string; icon: React.ReactNode; label: string; desc: string
}) {
  return (
    <Link href={href} className="flex items-center gap-3 p-3 rounded-xl border border-base-300/60 bg-base-100 hover:border-primary/30 transition-colors group">
      <div className="w-10 h-10 rounded-lg bg-base-200 flex items-center justify-center flex-shrink-0 text-base-content/60 group-hover:bg-primary/10 group-hover:text-primary transition-colors">{icon}</div>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium block">{label}</span>
        <span className="text-[11px] text-base-content/40">{desc}</span>
      </div>
    </Link>
  )
}
