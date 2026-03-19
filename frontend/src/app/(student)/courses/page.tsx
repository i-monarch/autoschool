'use client'

import { BookOpen, Search, Filter } from 'lucide-react'

export default function CoursesPage() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Мої курси</h1>
          <p className="text-base-content/60 text-sm mt-1">Всі доступні курси та ваш прогрес</p>
        </div>
        <div className="flex gap-2">
          <div className="join flex-1 sm:flex-none">
            <div className="join-item flex items-center pl-3 bg-base-100 border border-base-300/60 border-r-0">
              <Search className="w-4 h-4 text-base-content/40" />
            </div>
            <input
              type="text"
              placeholder="Пошук курсу..."
              className="input input-bordered join-item input-sm w-full sm:w-48 border-l-0 focus:outline-none"
            />
          </div>
          <button className="btn btn-sm btn-ghost gap-1.5">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Фільтр</span>
          </button>
        </div>
      </div>

      {/* Empty state */}
      <div className="card bg-base-100 border border-base-300/60">
        <div className="card-body items-center text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-primary/5 flex items-center justify-center mb-4">
            <BookOpen className="w-9 h-9 text-primary/40" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Курсів поки немає</h3>
          <p className="text-base-content/60 max-w-md">
            Тут будуть ваші курси з відеоуроками, матеріалами та тестами.
            Щоб отримати доступ, оберіть тариф та оплатіть навчання.
          </p>
        </div>
      </div>
    </div>
  )
}
