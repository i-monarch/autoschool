'use client'

interface DayData {
  date: string
  day: string
  questions: number
  correct: number
  xp: number
  active: boolean
}

const DAY_LABELS: Record<string, string> = {
  Mon: 'Пн', Tue: 'Вт', Wed: 'Ср', Thu: 'Чт', Fri: 'Пт', Sat: 'Сб', Sun: 'Нд',
}

export default function WeeklyActivity({ weekly }: { weekly: DayData[] }) {
  const maxQ = Math.max(...weekly.map(d => d.questions), 1)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="card bg-base-100 border border-base-300/60 p-5">
      <h3 className="text-sm font-medium mb-4">Активність за тиждень</h3>
      <div className="flex items-end gap-2 h-28">
        {weekly.map((d) => {
          const h = Math.max(8, (d.questions / maxQ) * 100)
          const isToday = d.date === today
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-[10px] text-base-content/50 tabular-nums">
                {d.questions > 0 ? d.questions : ''}
              </span>
              <div
                className={`w-full rounded-lg transition-all ${
                  d.active
                    ? isToday
                      ? 'bg-gradient-to-t from-primary to-primary/60'
                      : 'bg-primary/40'
                    : 'bg-base-200'
                }`}
                style={{ height: `${h}%` }}
              />
              <span className={`text-[10px] font-medium ${
                isToday ? 'text-primary' : 'text-base-content/40'
              }`}>
                {DAY_LABELS[d.day] || d.day}
              </span>
            </div>
          )
        })}
      </div>
      <div className="flex justify-between mt-3 pt-3 border-t border-base-300/40">
        <span className="text-xs text-base-content/50">
          Всього: <b>{weekly.reduce((s, d) => s + d.questions, 0)}</b> питань
        </span>
        <span className="text-xs text-base-content/50">
          XP: <b>+{weekly.reduce((s, d) => s + d.xp, 0)}</b>
        </span>
      </div>
    </div>
  )
}
