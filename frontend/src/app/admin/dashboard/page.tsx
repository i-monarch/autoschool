'use client'

import { Users, CreditCard, BookOpen, UserPlus, DollarSign } from 'lucide-react'

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Дашборд</h1>
        <p className="text-base-content/60 text-sm mt-1">Загальна статистика платформи</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label="Всього учнів" value="0" change="+0 цього тижня" icon={<Users className="w-5 h-5" />} color="secondary" />
        <StatCard label="Активні підписки" value="0" change="0 активних" icon={<UserPlus className="w-5 h-5" />} color="success" />
        <StatCard label="Дохід (місяць)" value="0 грн" change="Березень 2026" icon={<DollarSign className="w-5 h-5" />} color="primary" />
        <StatCard label="Курсів опубліковано" value="0" change="0 уроків" icon={<BookOpen className="w-5 h-5" />} color="info" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Нові реєстрації</h2>
          <div className="card bg-base-100 border border-base-300/60">
            <div className="card-body p-0">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr className="text-xs text-base-content/50">
                      <th>Учень</th>
                      <th>Дата</th>
                      <th>Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={3} className="text-center text-sm text-base-content/40 py-8">
                        Немає реєстрацій
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Останні платежі</h2>
          <div className="card bg-base-100 border border-base-300/60">
            <div className="card-body p-0">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr className="text-xs text-base-content/50">
                      <th>Учень</th>
                      <th>Тариф</th>
                      <th>Сума</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={3} className="text-center text-sm text-base-content/40 py-8">
                        Немає платежів
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, change, icon, color }: {
  label: string; value: string; change: string; icon: React.ReactNode; color: string
}) {
  return (
    <div className="card bg-base-100 border border-base-300/60 p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-${color}/10 text-${color}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-base-content/50 mt-1">{label}</p>
      <p className="text-xs text-base-content/40 mt-2">{change}</p>
    </div>
  )
}
