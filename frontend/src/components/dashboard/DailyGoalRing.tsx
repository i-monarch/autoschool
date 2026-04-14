'use client'

import { useState } from 'react'
import { Target, ChevronDown } from 'lucide-react'
import api from '@/lib/api'

interface DailyGoalData {
  target: number
  current: number
  completed: boolean
}

const GOAL_OPTIONS = [5, 10, 20, 30, 50]

export default function DailyGoalRing({ goal, onUpdate }: { goal: DailyGoalData; onUpdate?: () => void }) {
  const [showSelector, setShowSelector] = useState(false)
  const pct = Math.min(100, Math.round((goal.current / goal.target) * 100))
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  const handleChangeGoal = async (target: number) => {
    try {
      await api.patch('/motivation/daily-goal/', { target_questions: target })
      setShowSelector(false)
      onUpdate?.()
    } catch { /* ignore */ }
  }

  return (
    <div className="card bg-base-100 border border-base-300/60 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Мета на сьогодні</span>
        </div>
        <button
          onClick={() => setShowSelector(!showSelector)}
          className="btn btn-ghost btn-xs gap-1"
        >
          {goal.target} питань
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {showSelector && (
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {GOAL_OPTIONS.map(n => (
            <button
              key={n}
              onClick={() => handleChangeGoal(n)}
              className={`btn btn-xs ${n === goal.target ? 'btn-primary' : 'btn-outline'}`}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-5">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r={radius} fill="none" stroke="currentColor"
              className="text-base-200" strokeWidth="6" />
            <circle cx="48" cy="48" r={radius} fill="none"
              stroke="url(#goalGradient)" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              className="transition-all duration-700"
            />
            <defs>
              <linearGradient id="goalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold">{pct}%</span>
          </div>
        </div>

        <div className="flex-1">
          <p className="text-2xl font-bold">{goal.current}<span className="text-base text-base-content/40">/{goal.target}</span></p>
          <p className="text-xs text-base-content/50 mt-0.5">питань відповіли</p>
          {goal.completed && (
            <div className="badge badge-success badge-sm mt-2 gap-1">Мета досягнута!</div>
          )}
        </div>
      </div>
    </div>
  )
}
