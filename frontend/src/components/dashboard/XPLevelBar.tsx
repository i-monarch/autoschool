'use client'

import { Sparkles } from 'lucide-react'

interface XPData {
  total_xp: number
  level: number
  xp_for_next_level: number
  xp_in_current_level: number
}

export default function XPLevelBar({ xp }: { xp: XPData }) {
  const pct = Math.min(100, Math.round((xp.xp_in_current_level / xp.xp_for_next_level) * 100))

  return (
    <div className="card bg-base-100 border border-base-300/60 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">{xp.level}</span>
          </div>
          <div>
            <p className="text-sm font-medium">Рівень {xp.level}</p>
            <p className="text-xs text-base-content/40">{xp.total_xp} XP загалом</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-base-content/50">
          <Sparkles className="w-3.5 h-3.5 text-violet-500" />
          {xp.xp_in_current_level}/{xp.xp_for_next_level}
        </div>
      </div>
      <div className="w-full bg-base-200 rounded-full h-2.5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
