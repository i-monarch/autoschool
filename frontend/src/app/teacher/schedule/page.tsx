'use client'

import { Calendar, Plus, ChevronLeft, ChevronRight } from 'lucide-react'

export default function TeacherSchedulePage() {
  const today = new Date()
  const monthName = today.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' })

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Розклад</h1>
          <p className="text-base-content/60 text-sm mt-1">Управління слотами та заняттями</p>
        </div>
        <button className="btn btn-secondary btn-sm gap-2" disabled>
          <Plus className="w-4 h-4" />
          Додати слот
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <button className="btn btn-ghost btn-sm btn-square">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium capitalize">{monthName}</span>
        <button className="btn btn-ghost btn-sm btn-square">
          <ChevronRight className="w-4 h-4" />
        </button>
        <button className="btn btn-ghost btn-xs ml-2">Сьогодні</button>
      </div>

      <div className="card bg-base-100 border border-base-300/60">
        <div className="card-body items-center text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-info/5 flex items-center justify-center mb-4">
            <Calendar className="w-9 h-9 text-info/40" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Розклад порожній</h3>
          <p className="text-base-content/60 max-w-md text-sm">
            Додайте слоти, щоб учні могли записуватися на заняття.
            Ви можете створити одноразові або повторювані слоти.
          </p>
        </div>
      </div>
    </div>
  )
}
