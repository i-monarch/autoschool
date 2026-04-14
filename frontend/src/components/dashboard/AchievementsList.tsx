'use client'

import { Award, Lock } from 'lucide-react'
import Link from 'next/link'

interface AchievementBrief {
  code: string
  name: string
  icon: string
  earned_at: string
}

interface AchievementsData {
  earned: number
  total: number
  recent: AchievementBrief[]
}

const ICON_COLORS: Record<string, string> = {
  rocket: 'text-blue-500',
  'clipboard-check': 'text-emerald-500',
  award: 'text-amber-500',
  crown: 'text-yellow-500',
  star: 'text-yellow-400',
  flame: 'text-orange-500',
  trophy: 'text-amber-600',
  target: 'text-red-500',
  zap: 'text-yellow-500',
  'check-circle': 'text-green-500',
  'shield-check': 'text-blue-600',
  calendar: 'text-cyan-500',
  'calendar-check': 'text-teal-500',
  'trending-up': 'text-indigo-500',
  medal: 'text-orange-600',
  sparkles: 'text-violet-500',
  gem: 'text-purple-500',
}

export default function AchievementsList({ achievements }: { achievements: AchievementsData }) {
  const pct = achievements.total > 0 ? Math.round((achievements.earned / achievements.total) * 100) : 0

  return (
    <div className="card bg-base-100 border border-base-300/60 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-warning" />
          <span className="text-sm font-medium">Досягнення</span>
        </div>
        <Link href="/achievements" className="text-xs text-primary hover:underline">
          Всі {achievements.earned}/{achievements.total}
        </Link>
      </div>

      <div className="w-full bg-base-200 rounded-full h-1.5 mb-4">
        <div
          className="h-full rounded-full bg-warning transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      {achievements.recent.length > 0 ? (
        <div className="space-y-2">
          {achievements.recent.map((a) => (
            <div key={a.code} className="flex items-center gap-3 p-2 rounded-lg bg-base-200/50">
              <div className={`w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center ${ICON_COLORS[a.icon] || 'text-warning'}`}>
                <Award className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{a.name}</p>
                <p className="text-[10px] text-base-content/40">
                  {new Date(a.earned_at).toLocaleDateString('uk-UA')}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <Lock className="w-8 h-8 text-base-content/20 mx-auto mb-2" />
          <p className="text-xs text-base-content/40">Пройдіть перший тест, щоб отримати досягнення</p>
        </div>
      )}
    </div>
  )
}
