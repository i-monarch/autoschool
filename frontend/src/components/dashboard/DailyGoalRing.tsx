'use client'

import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
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
  const radius = 38
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
    <div className={`card border p-5 transition-all ${
      goal.completed
        ? 'bg-gradient-to-br from-emerald-50 to-green-50/50 border-emerald-200/60'
        : 'bg-base-100 border-base-300/60'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-base-content/60">Мета на сьогодні</p>
        <button
          onClick={() => setShowSelector(!showSelector)}
          className="btn btn-ghost btn-sm gap-1 text-base-content/50"
        >
          {goal.target} питань
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSelector ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {showSelector && (
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {GOAL_OPTIONS.map(n => (
            <button
              key={n}
              onClick={() => handleChangeGoal(n)}
              className={`btn btn-sm ${n === goal.target ? 'btn-primary' : 'btn-ghost border border-base-300/60'}`}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 88 88">
            <circle cx="44" cy="44" r={radius} fill="none" stroke="currentColor"
              className="text-base-200" strokeWidth="5" />
            <circle cx="44" cy="44" r={radius} fill="none"
              className={goal.completed ? 'text-emerald-500' : 'text-primary'}
              strokeWidth="5" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.7s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {goal.completed ? (
              <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
            ) : (
              <span className="text-lg font-bold tabular-nums">{pct}%</span>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-2xl font-bold tabular-nums">
            {goal.current}
            <span className="text-base text-base-content/30 font-normal"> / {goal.target}</span>
          </p>
          <p className="text-sm text-base-content/50 mt-0.5">
            {goal.completed ? 'Мета досягнута!' : `Ще ${goal.target - goal.current} питань`}
          </p>
          {!goal.completed && (
            <div className="w-full bg-base-200 rounded-full h-1.5 mt-2">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
