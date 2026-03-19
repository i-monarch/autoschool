'use client'

import { Users, Search } from 'lucide-react'

export default function TeacherStudentsPage() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Учні</h1>
          <p className="text-base-content/60 text-sm mt-1">Список учнів та їх прогрес</p>
        </div>
        <div className="join">
          <div className="join-item flex items-center pl-3 bg-base-100 border border-base-300/60 border-r-0">
            <Search className="w-4 h-4 text-base-content/40" />
          </div>
          <input
            type="text"
            placeholder="Пошук учня..."
            className="input input-bordered join-item input-sm w-full sm:w-56 border-l-0 focus:outline-none"
          />
        </div>
      </div>

      <div className="card bg-base-100 border border-base-300/60">
        <div className="card-body items-center text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-secondary/5 flex items-center justify-center mb-4">
            <Users className="w-9 h-9 text-secondary/40" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Поки немає учнів</h3>
          <p className="text-base-content/60 max-w-md text-sm">
            Тут буде список ваших учнів з інформацією про їх прогрес,
            пройдені уроки та результати тестів.
          </p>
        </div>
      </div>
    </div>
  )
}
