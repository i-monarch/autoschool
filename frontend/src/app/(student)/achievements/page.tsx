'use client'

import { useEffect, useState } from 'react'
import { Award, Lock, CheckCircle, Sparkles } from 'lucide-react'
import api from '@/lib/api'

interface AchievementItem {
  id: number
  code: string
  name: string
  description: string
  icon: string
  xp_reward: number
  earned: boolean
  earned_at: string | null
}

const CATEGORY_LABELS: Record<string, string> = {
  tests: 'Тести',
  streak: 'Серія навчання',
  theory: 'Теорія',
  courses: 'Курси',
  social: 'Спільнота',
}

export default function AchievementsPage() {
  const [data, setData] = useState<Record<string, AchievementItem[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/motivation/achievements/')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const allAchievements = Object.values(data).flat()
  const earned = allAchievements.filter(a => a.earned).length
  const total = allAchievements.length

  if (loading) return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg" /></div>

  return (
    <div>
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border border-amber-200/60 mb-6">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <svg className="absolute bottom-0 right-4 w-[200px] h-full opacity-[0.06]" viewBox="0 0 200 120" fill="none">
            <circle cx="100" cy="50" r="40" stroke="currentColor" strokeWidth="6" className="text-amber-800" />
            <path d="M85 50 L95 60 L115 40" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-800" />
            <path d="M60 95 L100 80 L140 95" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-amber-800" />
          </svg>
        </div>
        <div className="relative px-6 py-6 sm:px-8 sm:py-7">
          <h1 className="text-2xl sm:text-3xl font-bold text-base-content mb-2">Досягнення</h1>
          <div className="flex items-center gap-3">
            <div className="flex-1 max-w-xs">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-base-content/60">Прогрес</span>
                <span className="font-semibold text-amber-700">{earned}/{total}</span>
              </div>
              <div className="w-full bg-amber-200/50 rounded-full h-2.5">
                <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${total > 0 ? (earned / total * 100) : 0}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-amber-700">
              <Sparkles className="w-4 h-4" />
              {allAchievements.filter(a => a.earned).reduce((s, a) => s + a.xp_reward, 0)} XP
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      {Object.entries(data).map(([category, items]) => (
        <div key={category} className="mb-6">
          <h2 className="text-lg font-semibold mb-3">{CATEGORY_LABELS[category] || category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map(ach => (
              <div
                key={ach.id}
                className={`card border p-4 transition-all ${
                  ach.earned
                    ? 'bg-base-100 border-warning/30 shadow-sm'
                    : 'bg-base-200/50 border-base-300/40 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    ach.earned ? 'bg-warning/15 text-warning' : 'bg-base-300/50 text-base-content/30'
                  }`}>
                    {ach.earned ? <Award className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium truncate">{ach.name}</p>
                      {ach.earned && <CheckCircle className="w-3.5 h-3.5 text-success flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-base-content/50 mt-0.5">{ach.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-base-content/40">+{ach.xp_reward} XP</span>
                      {ach.earned && ach.earned_at && (
                        <span className="text-[10px] text-base-content/40">
                          {new Date(ach.earned_at).toLocaleDateString('uk-UA')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
