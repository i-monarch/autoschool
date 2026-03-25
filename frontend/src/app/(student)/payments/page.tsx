'use client'

import { useEffect, useState } from 'react'
import { CreditCard, Check, Crown, Zap, Star } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

interface Tariff {
  id: number
  name: string
  description: string
  price: string
  duration_days: number
  features: string[]
  is_popular: boolean
}

function formatDuration(days: number): string {
  if (days % 365 === 0) {
    const years = days / 365
    return `${years} ${years === 1 ? 'рік' : 'роки'}`
  }
  if (days % 30 === 0) {
    const months = days / 30
    return `${months} ${months === 1 ? 'місяць' : months < 5 ? 'місяці' : 'місяців'}`
  }
  return `${days} ${days === 1 ? 'день' : 'днів'}`
}

const colorCycle = ['primary', 'secondary', 'accent']
const iconCycle = [
  <Zap key="z" className="w-5 h-5" />,
  <Crown key="c" className="w-5 h-5" />,
  <Star key="s" className="w-5 h-5" />,
]

export default function PaymentsPage() {
  const [tariffs, setTariffs] = useState<Tariff[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()

  useEffect(() => {
    api.get<Tariff[]>('/payments/tariffs/')
      .then(({ data }) => setTariffs(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Оплата та тарифи</h1>
        <p className="text-base-content/60 text-sm mt-1">Оберіть тариф для доступу до навчання</p>
      </div>

      {/* Subscription status */}
      {user?.is_paid ? (
        <div className="alert bg-success/10 border border-success/20 mb-8">
          <Check className="w-5 h-5 text-success" />
          <div>
            <p className="font-medium text-sm">Підписка активна</p>
            {user.paid_until && (
              <p className="text-xs text-base-content/60">
                Дійсна до {new Date(user.paid_until).toLocaleDateString('uk-UA')}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="alert bg-warning/10 border border-warning/20 mb-8">
          <CreditCard className="w-5 h-5 text-warning" />
          <div>
            <p className="font-medium text-sm">Немає активної підписки</p>
            <p className="text-xs text-base-content/60">Оберіть тариф, щоб отримати повний доступ до курсів та тестів</p>
          </div>
        </div>
      )}

      {/* Tariffs */}
      <h2 className="text-lg font-semibold mb-4">Тарифи</h2>

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-md" />
        </div>
      ) : tariffs.length === 0 ? (
        <div className="card bg-base-100 border border-base-300/60">
          <div className="card-body items-center text-center py-10">
            <p className="text-base-content/50 text-sm">Тарифи поки не додані</p>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {tariffs.map((tariff, index) => {
            const color = colorCycle[index % colorCycle.length]
            const icon = iconCycle[index % iconCycle.length]
            return (
              <div
                key={tariff.id}
                className={`card bg-base-100 border ${tariff.is_popular ? 'border-secondary shadow-md' : 'border-base-300/60'} relative`}
              >
                {tariff.is_popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="badge badge-secondary badge-sm font-medium">Популярний</span>
                  </div>
                )}
                <div className="card-body p-5">
                  <div className={`w-10 h-10 rounded-xl bg-${color}/10 text-${color} flex items-center justify-center`}>
                    {icon}
                  </div>
                  <h3 className="font-semibold text-lg mt-2">{tariff.name}</h3>
                  {tariff.description && (
                    <p className="text-sm text-base-content/60">{tariff.description}</p>
                  )}
                  <div className="mt-1">
                    <span className="text-3xl font-bold">
                      {Number(tariff.price).toLocaleString('uk-UA')}
                    </span>
                    <span className="text-base-content/60 text-sm ml-1">
                      грн / {formatDuration(tariff.duration_days)}
                    </span>
                  </div>
                  {tariff.features.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {tariff.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <button
                    className={`btn btn-sm mt-4 ${tariff.is_popular ? 'btn-secondary' : 'btn-outline'}`}
                    disabled
                  >
                    Обрати тариф
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Payment history placeholder */}
      <h2 className="text-lg font-semibold mb-4">Історія платежів</h2>
      <div className="card bg-base-100 border border-base-300/60">
        <div className="card-body items-center text-center py-10">
          <p className="text-base-content/50 text-sm">Платежів ще немає</p>
        </div>
      </div>
    </div>
  )
}
