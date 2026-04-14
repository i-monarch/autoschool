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

  return (
    <div className="card bg-base-100 border border-base-300/60 p-5">
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
          streak.current_streak > 0
            ? 'bg-gradient-to-br from-orange-400 to-red-500 shadow-lg shadow-orange-200'
            : 'bg-base-200'
        }`}>
          <Flame className={`w-7 h-7 ${streak.current_streak > 0 ? 'text-white' : 'text-base-content/30'}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tabular-nums">{streak.current_streak}</span>
            <span className="text-sm text-base-content/50">
              {streak.current_streak === 1 ? 'день' : streak.current_streak < 5 ? 'дні' : 'днів'}
            </span>
          </div>
          <p className="text-xs text-base-content/50 mt-0.5">
            {isActiveToday ? 'Сьогодні ви вже навчалися!' : 'Пройдіть тест, щоб продовжити серію'}
          </p>
        </div>
      </div>

      <div className="flex gap-4 mt-4 pt-3 border-t border-base-300/40">
        <div className="flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-warning" />
          <span className="text-xs text-base-content/60">Рекорд: <b>{streak.longest_streak}</b></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-info" />
          <span className="text-xs text-base-content/60">Всього: <b>{streak.total_study_days}</b> днів</span>
        </div>
      </div>
    </div>
  )
}
