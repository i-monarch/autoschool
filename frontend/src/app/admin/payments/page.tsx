'use client'

import { CreditCard } from 'lucide-react'

export default function AdminPaymentsPage() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Платежі</h1>
          <p className="text-base-content/60 text-sm mt-1">Історія платежів, тарифи та промокоди</p>
        </div>
      </div>

      <div className="tabs tabs-boxed bg-base-200/50 p-1 mb-6 w-fit">
        <button className="tab tab-sm tab-active">Платежі</button>
        <button className="tab tab-sm">Тарифи</button>
        <button className="tab tab-sm">Промокоди</button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="card bg-base-100 border border-base-300/60 p-4">
          <p className="text-xs text-base-content/50 mb-1">Всього платежів</p>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="card bg-base-100 border border-base-300/60 p-4">
          <p className="text-xs text-base-content/50 mb-1">Дохід за місяць</p>
          <p className="text-2xl font-bold">0 грн</p>
        </div>
        <div className="card bg-base-100 border border-base-300/60 p-4">
          <p className="text-xs text-base-content/50 mb-1">Активних підписок</p>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>

      <div className="card bg-base-100 border border-base-300/60">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="text-xs text-base-content/50">
                  <th>Учень</th>
                  <th>Тариф</th>
                  <th>Сума</th>
                  <th>Статус</th>
                  <th>Дата</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5} className="text-center text-sm text-base-content/40 py-12">
                    <CreditCard className="w-8 h-8 mx-auto text-base-content/20 mb-2" />
                    <p>Немає платежів</p>
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
