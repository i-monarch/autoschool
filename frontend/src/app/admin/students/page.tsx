'use client'

import { Users, Search, Download } from 'lucide-react'

export default function AdminStudentsPage() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Учні</h1>
          <p className="text-base-content/60 text-sm mt-1">Управління учнями та підписками</p>
        </div>
        <button className="btn btn-sm btn-outline gap-2" disabled>
          <Download className="w-4 h-4" />
          Експорт
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <div className="join flex-1 sm:flex-none">
          <div className="join-item flex items-center pl-3 bg-base-100 border border-base-300/60 border-r-0">
            <Search className="w-4 h-4 text-base-content/40" />
          </div>
          <input
            type="text"
            placeholder="Пошук за ім'ям або email..."
            className="input input-bordered join-item input-sm w-full sm:w-64 border-l-0 focus:outline-none"
          />
        </div>
        <select className="select select-bordered select-sm">
          <option>Всі статуси</option>
          <option>Активна підписка</option>
          <option>Без підписки</option>
          <option>Підписка закінчується</option>
        </select>
      </div>

      <div className="card bg-base-100 border border-base-300/60">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="text-xs text-base-content/50">
                  <th>Учень</th>
                  <th>Email</th>
                  <th>Підписка</th>
                  <th>Прогрес</th>
                  <th>Реєстрація</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={6} className="text-center text-sm text-base-content/40 py-12">
                    <Users className="w-8 h-8 mx-auto text-base-content/20 mb-2" />
                    <p>Немає зареєстрованих учнів</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
