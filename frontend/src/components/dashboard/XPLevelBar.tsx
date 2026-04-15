'use client'

interface XPData {
  total_xp: number
  level: number
  xp_for_next_level: number
  xp_in_current_level: number
}

export default function XPLevelBar({ xp }: { xp: XPData }) {
  const pct = Math.min(100, Math.round((xp.xp_in_current_level / xp.xp_for_next_level) * 100))

  return (
    <div className="card bg-gradient-to-br from-violet-50 to-purple-50/50 border border-violet-200/60 p-5">
      <p className="text-xs text-base-content/50 mb-2">Рівень та досвід</p>

      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm shadow-violet-200">
          <span className="text-white text-lg font-bold">{xp.level}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Рівень {xp.level}</p>
          <p className="text-xs text-base-content/40 tabular-nums">{xp.total_xp.toLocaleString()} XP загалом</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-1.5">
        <div className="flex-1 bg-violet-200/50 rounded-full h-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[11px] text-base-content/40 tabular-nums flex-shrink-0">
          {xp.xp_in_current_level}/{xp.xp_for_next_level}
        </span>
      </div>

      <p className="text-[11px] text-base-content/40">
        {xp.xp_for_next_level - xp.xp_in_current_level} XP до рівня {xp.level + 1}
      </p>
    </div>
  )
}
