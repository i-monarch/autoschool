'use client'

import { useEffect, useState } from 'react'
import { ClipboardCheck, Clock, Target, TrendingUp, ChevronRight, BookOpen } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'

interface Category {
  id: number
  name: string
  slug: string
  question_count: number
}

interface Stats {
  total_attempts: number
  total_correct: number
  total_questions: number
  avg_percent: number
}

export default function TestsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/tests/categories/').then(r => r.data),
      api.get('/tests/stats/').then(r => r.data).catch(() => null),
    ]).then(([cats, st]) => {
      setCategories(cats)
      setStats(st)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Тести ПДР</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Тести ПДР</h1>
        <p className="text-base-content/60 text-sm mt-1">Тренуйтесь та перевіряйте свої знання</p>
      </div>

      {/* Test modes */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Link href="/tests/exam" className="card bg-base-100 border border-base-300/60 hover:border-error/40 hover:shadow-md transition-all group cursor-pointer">
          <div className="card-body p-5">
            <div className="w-12 h-12 rounded-xl bg-error/10 text-error flex items-center justify-center mb-2">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-semibold">Екзамен</h3>
            <p className="text-sm text-base-content/60">20 питань, 20 хвилин. Як у сервісному центрі.</p>
          </div>
        </Link>

        <Link href="/tests/marathon" className="card bg-base-100 border border-base-300/60 hover:border-accent/40 hover:shadow-md transition-all group cursor-pointer">
          <div className="card-body p-5">
            <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-2">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-semibold">Марафон</h3>
            <p className="text-sm text-base-content/60">Без обмежень часу. Тренування з поясненнями.</p>
          </div>
        </Link>

        <Link href="/tests/history" className="card bg-base-100 border border-base-300/60 hover:border-primary/40 hover:shadow-md transition-all group cursor-pointer">
          <div className="card-body p-5">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-semibold">Мої результати</h3>
            <p className="text-sm text-base-content/60">
              {stats && stats.total_attempts > 0
                ? `${stats.total_attempts} спроб, ${stats.avg_percent}% правильних`
                : 'Історія ваших спроб'
              }
            </p>
          </div>
        </Link>
      </div>

      {/* Quick stats */}
      {stats && stats.total_attempts > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="card bg-base-100 border border-base-300/60 p-4 text-center">
            <p className="text-2xl font-bold">{stats.total_attempts}</p>
            <p className="text-xs text-base-content/50">Тестів пройдено</p>
          </div>
          <div className="card bg-base-100 border border-base-300/60 p-4 text-center">
            <p className="text-2xl font-bold">{stats.total_correct}/{stats.total_questions}</p>
            <p className="text-xs text-base-content/50">Правильних відповідей</p>
          </div>
          <div className="card bg-base-100 border border-base-300/60 p-4 text-center">
            <p className="text-2xl font-bold text-primary">{stats.avg_percent}%</p>
            <p className="text-xs text-base-content/50">Середній результат</p>
          </div>
        </div>
      )}

      {/* Topics */}
      <h2 className="text-lg font-semibold mb-4">За темами</h2>
      {categories.length === 0 ? (
        <div className="card bg-base-100 border border-base-300/60">
          <div className="card-body items-center text-center py-12">
            <ClipboardCheck className="w-12 h-12 text-base-content/20 mb-3" />
            <p className="text-base-content/50">Питання ще не завантажено</p>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/tests/topic/${cat.id}`}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-base-100 border border-base-300/60 hover:border-primary/30 hover:bg-primary/5 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                <Target className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{cat.name}</p>
                <p className="text-xs text-base-content/50">{cat.question_count} питань</p>
              </div>
              <ChevronRight className="w-4 h-4 text-base-content/20 group-hover:text-primary/60 transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
