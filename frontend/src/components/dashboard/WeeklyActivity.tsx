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
  const totalQuestions = weekly.reduce((s, d) => s + d.questions, 0)
  const totalCorrect = weekly.reduce((s, d) => s + d.correct, 0)
  const totalXp = weekly.reduce((s, d) => s + d.xp, 0)
  const activeDays = weekly.filter(d => d.active).length

  return (
    <div className="card bg-base-100 border border-base-300/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">Активність за тиждень</h3>
        {activeDays > 0 && (
          <span className="text-xs text-base-content/40">{activeDays} з 7 днів</span>
        )}
      </div>

      <div className="flex items-end gap-1.5 h-32">
        {weekly.map((d) => {
          const pct = d.questions > 0 ? Math.max(15, (d.questions / maxQ) * 100) : 0
          const isToday = d.date === today
          const accuracy = d.questions > 0 ? Math.round((d.correct / d.questions) * 100) : 0

          return (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
              {/* Tooltip */}
              {d.active && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                  <div className="bg-neutral text-neutral-content text-[10px] rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg">
                    <p className="font-semibold">{d.questions} питань ({accuracy}%)</p>
                    <p className="text-neutral-content/60">+{d.xp} XP</p>
                  </div>
                </div>
              )}

              {/* Value label */}
              <span className="text-[11px] font-semibold tabular-nums min-h-[16px]">
                {d.questions > 0 ? d.questions : ''}
              </span>

              {/* Bar */}
              <div className="w-full flex items-end" style={{ height: '80px' }}>
                <div
                  className={`w-full rounded-lg transition-all ${
                    d.active
                      ? isToday
                        ? 'bg-gradient-to-t from-primary to-primary/70 shadow-sm shadow-primary/20'
                        : 'bg-primary/30'
                      : 'bg-base-200/60'
                  }`}
                  style={{ height: d.active ? `${pct}%` : '4px', minHeight: d.active ? '12px' : '4px' }}
                />
              </div>

              {/* Day label */}
              <span className={`text-[11px] font-medium ${
                isToday ? 'text-primary font-bold' : d.active ? 'text-base-content/60' : 'text-base-content/30'
              }`}>
                {DAY_LABELS[d.day] || d.day}
              </span>
            </div>
          )
        })}
      </div>

      {/* Stats footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-base-300/40">
        {totalQuestions > 0 ? (
          <>
            <div className="flex items-center gap-3">
              <span className="text-xs text-base-content/50">
                <b className="text-base-content">{totalQuestions}</b> питань
              </span>
              <span className="text-xs text-base-content/50">
                <b className="text-success">{totalCorrect}</b> вірних
              </span>
            </div>
            <span className="text-xs font-semibold text-primary">+{totalXp} XP</span>
          </>
        ) : (
          <span className="text-xs text-base-content/40">Пройдіть тест, щоб побачити активність</span>
        )}
      </div>
    </div>
  )
}
