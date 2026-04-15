'use client'

import { Flame, Trophy, Calendar } from 'lucide-react'

interface StreakData {
  current_streak: number
  longest_streak: number
  last_activity_date: string | null
  total_study_days: number
}

export default function StreakCard({ streak }: { streak: StreakData }) {
  const isActiveToday = streak.last_activity_date === new Date().toISOString().split('T')[0]
  const days = Array.from({ length: 7 }, (_, i) => i < streak.current_streak)

  return (
    <div className={`card border p-5 transition-all ${
      streak.current_streak > 0
        ? 'bg-gradient-to-br from-orange-50 to-amber-50/50 border-orange-200/60'
        : 'bg-base-100 border-base-300/60'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-base-content/50 mb-1">Серія навчання</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tabular-nums">{streak.current_streak}</span>
            <span className="text-sm text-base-content/40">
              {streak.current_streak === 1 ? 'день' : streak.current_streak < 5 ? 'дні' : 'днів'}
            </span>
          </div>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
          streak.current_streak > 0
            ? 'bg-gradient-to-br from-orange-400 to-red-500'
            : 'bg-base-200'
        }`}>
          <Flame className={`w-6 h-6 ${streak.current_streak > 0 ? 'text-white' : 'text-base-content/30'}`} />
        </div>
      </div>

      {/* Streak dots */}
      <div className="flex gap-1 mb-3">
        {days.map((active, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              active ? 'bg-orange-400' : 'bg-base-300/60'
            }`}
          />
        ))}
      </div>

      <p className="text-xs text-base-content/50 mb-3">
        {isActiveToday ? 'Сьогодні ви вже навчалися!' : 'Пройдіть тест, щоб продовжити серію'}
      </p>

      <div className="flex gap-4 pt-3 border-t border-orange-200/40">
        <div className="flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-xs text-base-content/60">Рекорд <b>{streak.longest_streak}</b></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-base-content/40" />
          <span className="text-xs text-base-content/60">Всього <b>{streak.total_study_days}</b></span>
        </div>
      </div>
    </div>
  )
}
