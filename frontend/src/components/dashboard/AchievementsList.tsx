'use client'

import {
  Award, Rocket, ClipboardCheck, Crown, Star, Flame,
  Trophy, Target, Zap, CheckCircle, ShieldCheck,
  Calendar, CalendarCheck, TrendingUp, Medal, Sparkles, Gem, Lock,
} from 'lucide-react'
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

const ICON_MAP: Record<string, typeof Award> = {
  rocket: Rocket,
  'clipboard-check': ClipboardCheck,
  award: Award,
  crown: Crown,
  star: Star,
  flame: Flame,
  trophy: Trophy,
  target: Target,
  zap: Zap,
  'check-circle': CheckCircle,
  'shield-check': ShieldCheck,
  calendar: Calendar,
  'calendar-check': CalendarCheck,
  'trending-up': TrendingUp,
  medal: Medal,
  sparkles: Sparkles,
  gem: Gem,
}

const ICON_BG: Record<string, string> = {
  rocket: 'bg-blue-100 text-blue-600',
  'clipboard-check': 'bg-emerald-100 text-emerald-600',
  award: 'bg-amber-100 text-amber-600',
  crown: 'bg-yellow-100 text-yellow-600',
  star: 'bg-yellow-100 text-yellow-500',
  flame: 'bg-orange-100 text-orange-600',
  trophy: 'bg-amber-100 text-amber-700',
  target: 'bg-red-100 text-red-600',
  zap: 'bg-yellow-100 text-yellow-600',
  'check-circle': 'bg-green-100 text-green-600',
  'shield-check': 'bg-blue-100 text-blue-700',
  calendar: 'bg-cyan-100 text-cyan-600',
  'calendar-check': 'bg-teal-100 text-teal-600',
  'trending-up': 'bg-indigo-100 text-indigo-600',
  medal: 'bg-orange-100 text-orange-700',
  sparkles: 'bg-violet-100 text-violet-600',
  gem: 'bg-purple-100 text-purple-600',
}

export default function AchievementsList({ achievements }: { achievements: AchievementsData }) {
  const pct = achievements.total > 0 ? Math.round((achievements.earned / achievements.total) * 100) : 0

  return (
    <div className="card bg-base-100 border border-base-300/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-base-content/50 mb-0.5">Досягнення</p>
          <p className="text-sm font-medium">{achievements.earned} з {achievements.total} <span className="text-base-content/30">({pct}%)</span></p>
        </div>
        <Link href="/achievements" className="btn btn-ghost btn-xs text-primary">
          Всі
        </Link>
      </div>

      <div className="w-full bg-base-200 rounded-full h-1.5 mb-4">
        <div
          className="h-full rounded-full bg-amber-400 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      {achievements.recent.length > 0 ? (
        <div className="space-y-2">
          {achievements.recent.map((a) => {
            const Icon = ICON_MAP[a.icon] || Award
            const colorClass = ICON_BG[a.icon] || 'bg-amber-100 text-amber-600'
            return (
              <div key={a.code} className="flex items-center gap-3 p-2.5 rounded-xl bg-base-200/40">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{a.name}</p>
                  <p className="text-xs text-base-content/40">
                    {new Date(a.earned_at).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-xl bg-base-200 flex items-center justify-center mx-auto mb-2">
            <Lock className="w-5 h-5 text-base-content/20" />
          </div>
          <p className="text-xs text-base-content/40">Пройдіть тест, щоб отримати першу нагороду</p>
        </div>
      )}
    </div>
  )
}
