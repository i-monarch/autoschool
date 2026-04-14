'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Mail, Phone, Calendar, Flame, Trophy,
  Sparkles, CheckCircle, XCircle, BarChart3,
} from 'lucide-react'
import api from '@/lib/api'

interface StudentDetail {
  student: {
    id: number; username: string; full_name: string; email: string
    phone: string | null; access_type: string; is_paid: boolean
    paid_until: string | null; created_at: string; last_login: string | null
  }
  test_stats: {
    total_attempts: number; passed: number; avg_percent: number
    total_correct: number; total_questions: number
  }
  recent_results: Array<{
    test_type: string; category_name: string | null
    score: number; total: number; is_passed: boolean; finished_at: string
  }>
  category_stats: Array<{ category_name: string; percent: number; attempts: number }>
  motivation: {
    current_streak: number; longest_streak: number
    total_study_days: number; level: number; total_xp: number
  } | null
}

const TEST_TYPE_LABELS: Record<string, string> = {
  exam: 'Екзамен', topic: 'По темах', marathon: 'Марафон',
}

export default function TeacherStudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<StudentDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/teacher/students/${params.id}/`)
      .then(r => setData(r.data))
      .catch(() => router.push('/teacher/students'))
      .finally(() => setLoading(false))
  }, [params.id, router])

  if (loading) return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg" /></div>
  if (!data) return null

  const { student, test_stats, recent_results, category_stats, motivation } = data

  return (
    <div>
      <button onClick={() => router.back()} className="btn btn-ghost btn-sm gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> Назад
      </button>

      {/* Student header */}
      <div className="card bg-base-100 border border-base-300/60 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="avatar placeholder">
            <div className="bg-secondary text-secondary-content rounded-full w-16">
              <span className="text-2xl">{student.full_name[0]?.toUpperCase() || '?'}</span>
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{student.full_name}</h1>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-base-content/60">
              {student.email && (
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{student.email}</span>
              )}
              {student.phone && (
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{student.phone}</span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Зареєстрований {new Date(student.created_at).toLocaleDateString('uk-UA')}
              </span>
            </div>
          </div>
          <span className={`badge ${student.access_type === 'paid' ? 'badge-success' : student.access_type === 'trial' ? 'badge-warning' : 'badge-ghost'}`}>
            {student.access_type === 'paid' ? 'Оплачений' : student.access_type === 'trial' ? 'Пробний' : 'Безкоштовний'}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <MiniStat label="Тестів" value={String(test_stats.total_attempts)} />
        <MiniStat label="Здано" value={String(test_stats.passed)} />
        <MiniStat label="Середній бал" value={`${test_stats.avg_percent}%`} />
        {motivation && (
          <>
            <MiniStat label="Серія" value={`${motivation.current_streak}`} icon={<Flame className="w-4 h-4 text-orange-500" />} />
            <MiniStat label="Рівень" value={`${motivation.level}`} icon={<Sparkles className="w-4 h-4 text-violet-500" />} />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent results */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Останні результати</h2>
          {recent_results.length === 0 ? (
            <p className="text-sm text-base-content/50">Немає результатів</p>
          ) : (
            <div className="card bg-base-100 border border-base-300/60 overflow-x-auto">
              <table className="table table-sm">
                <thead><tr><th>Тип</th><th>Результат</th><th>Статус</th><th>Дата</th></tr></thead>
                <tbody>
                  {recent_results.map((r, i) => (
                    <tr key={i} className="hover">
                      <td className="text-sm">{TEST_TYPE_LABELS[r.test_type] ?? r.test_type}</td>
                      <td className="text-sm font-medium">{r.score}/{r.total}</td>
                      <td>
                        {r.is_passed
                          ? <span className="badge badge-success badge-sm gap-1"><CheckCircle className="w-3 h-3" />Здано</span>
                          : <span className="badge badge-error badge-sm gap-1"><XCircle className="w-3 h-3" />Не здано</span>
                        }
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

        {/* Category stats */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-5 h-5 text-info" />
            <h2 className="text-lg font-semibold">Результати по темах</h2>
          </div>
          {category_stats.length === 0 ? (
            <p className="text-sm text-base-content/50">Немає даних</p>
          ) : (
            <div className="space-y-2">
              {category_stats.map((cat, i) => (
                <div key={i} className="card bg-base-100 border border-base-300/60 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate">{cat.category_name}</span>
                    <span className={`text-sm font-semibold ${
                      cat.percent < 50 ? 'text-error' : cat.percent < 70 ? 'text-warning' : 'text-success'
                    }`}>{cat.percent}%</span>
                  </div>
                  <progress
                    className={`progress w-full h-2 ${
                      cat.percent < 50 ? 'progress-error' : cat.percent < 70 ? 'progress-warning' : 'progress-success'
                    }`}
                    value={cat.percent} max={100}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Motivation info */}
          {motivation && (
            <div className="card bg-base-100 border border-base-300/60 p-4 mt-4">
              <h3 className="text-sm font-medium mb-3">Мотивація</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span>Рекорд серії: <b>{motivation.longest_streak}</b> днів</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-500" />
                  <span>Всього: <b>{motivation.total_study_days}</b> днів</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>XP: <b>{motivation.total_xp}</b></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MiniStat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="card bg-base-100 border border-base-300/60 p-3 text-center">
      {icon && <div className="flex justify-center mb-1">{icon}</div>}
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-base-content/50">{label}</p>
    </div>
  )
}
