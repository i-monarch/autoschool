'use client'

import { useEffect, useState } from 'react'
import { CreditCard, Check, Crown } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

interface Tariff {
  id: number
  name: string
  description: string
  price: string
  duration_days: number
  features: string[]
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

export default function PaymentsPage() {
  const [tariff, setTariff] = useState<Tariff | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()

  useEffect(() => {
    api.get<Tariff[]>('/payments/tariffs/')
      .then(({ data }) => {
        if (data.length > 0) setTariff(data[0])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Оплата</h1>
        <p className="text-base-content/60 text-sm mt-1">Підписка для повного доступу до навчання</p>
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
            <p className="text-xs text-base-content/60">Оформіть підписку для повного доступу до курсів та тестів</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-md" />
        </div>
      ) : tariff ? (
        <div className="max-w-md mx-auto">
          <div className="card bg-base-100 border-2 border-primary/30 shadow-lg">
            <div className="card-body p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{tariff.name}</h2>
                  {tariff.description && (
                    <p className="text-sm text-base-content/60">{tariff.description}</p>
                  )}
                </div>
              </div>

              <div className="my-4">
                <span className="text-4xl font-bold">
                  {Number(tariff.price).toLocaleString('uk-UA')}
                </span>
                <span className="text-base-content/60 ml-2">
                  грн / {formatDuration(tariff.duration_days)}
                </span>
              </div>

              {tariff.features.length > 0 && (
                <ul className="space-y-2.5 mb-6">
                  {tariff.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}

              <button className="btn btn-primary w-full" disabled>
                Оформити підписку
              </button>
              <p className="text-xs text-center text-base-content/40 mt-2">
                Онлайн-оплата буде доступна незабаром
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card bg-base-100 border border-base-300/60">
          <div className="card-body items-center text-center py-10">
            <p className="text-base-content/50 text-sm">Підписка поки не налаштована</p>
          </div>
        </div>
      )}
    </div>
  )
}
