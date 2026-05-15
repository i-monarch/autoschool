'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, CreditCard } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import {
  getInstructorTariffs,
  getMySubscription,
  subscribe as subscribeToTariff,
} from '@/lib/api/instructors'
import type { InstructorSubscription, InstructorTariff } from '@/types/instructors'

function formatPrice(price: string): string {
  return Number(price).toLocaleString('uk-UA')
}

function statusLabel(subscription: InstructorSubscription): string {
  if (subscription.payment_status === 'pending') return 'Очікує підтвердження'
  if (subscription.is_active && subscription.payment_status === 'paid') return 'Активна'
  return 'Неактивна'
}

export default function InstructorSubscriptionPage() {
  const addToast = useToast((s) => s.add)
  const [tariffs, setTariffs] = useState<InstructorTariff[]>([])
  const [subscription, setSubscription] = useState<InstructorSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [choosingId, setChoosingId] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([getInstructorTariffs(), getMySubscription()])
      .then(([tariffData, subscriptionData]) => {
        setTariffs(tariffData)
        setSubscription(subscriptionData)
      })
      .catch(() => addToast('Не вдалося завантажити підписки', 'error'))
      .finally(() => setLoading(false))
  }, [addToast])

  const hasPending = subscription?.payment_status === 'pending'

  const currentCard = useMemo(() => {
    if (!subscription) {
      return {
        title: 'Підписки немає',
        note: 'Оберіть тариф нижче, щоб відправити заявку адміністратору.',
        badge: 'badge-ghost',
      }
    }
    const isActive = subscription.is_active && subscription.payment_status === 'paid'
    return {
      title: statusLabel(subscription),
      note: `${subscription.tariff.name}. Дійсна до ${new Date(subscription.expires_at).toLocaleDateString('uk-UA')}.`,
      badge: subscription.payment_status === 'pending'
        ? 'badge-warning'
        : isActive ? 'badge-success' : 'badge-error',
    }
  }, [subscription])

  const handleSubscribe = async (tariffId: number) => {
    setChoosingId(tariffId)
    try {
      const response = await subscribeToTariff(tariffId)
      setSubscription(response.subscription)
      addToast('Підписку створено. Очікує підтвердження адміністратора (MVP)', 'success')
    } catch {
      addToast('Не вдалося створити підписку', 'error')
    } finally {
      setChoosingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-md text-warning" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Підписка</h1>
        <p className="text-base-content/60 text-sm mt-1">Тариф потрібен для публікації профілю інструктора.</p>
      </div>

      <div className="card bg-base-100 border border-base-300/60 mb-6">
        <div className="card-body p-5">
          <div className="flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-warning mt-1" />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold">Поточний стан</h2>
                <span className={`badge ${currentCard.badge}`}>{currentCard.title}</span>
              </div>
              <p className="text-sm text-base-content/60 mt-2">{currentCard.note}</p>
            </div>
          </div>
        </div>
      </div>

      {tariffs.length === 0 ? (
        <div className="card bg-base-100 border border-base-300/60">
          <div className="card-body items-center text-center py-10">
            <p className="text-sm text-base-content/50">Тарифи для інструкторів ще не налаштовані.</p>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tariffs.map((tariff) => (
            <div key={tariff.id} className={`card bg-base-100 border ${tariff.is_popular ? 'border-warning/60' : 'border-base-300/60'}`}>
              <div className="card-body p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-lg">{tariff.name}</h2>
                    {tariff.description && <p className="text-sm text-base-content/60 mt-1">{tariff.description}</p>}
                  </div>
                  {tariff.is_popular && <span className="badge badge-warning badge-sm">Популярний</span>}
                </div>

                <div className="my-4">
                  <span className="text-3xl font-bold">{formatPrice(tariff.price)}</span>
                  <span className="text-base-content/60 ml-2">грн</span>
                  <p className="text-sm text-base-content/50 mt-1">На {tariff.duration_days} днів</p>
                </div>

                {tariff.features.length > 0 && (
                  <ul className="space-y-2 mb-5">
                    {tariff.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <button
                  type="button"
                  onClick={() => handleSubscribe(tariff.id)}
                  disabled={hasPending || choosingId !== null}
                  className="btn btn-warning w-full mt-auto"
                >
                  {choosingId === tariff.id && <span className="loading loading-spinner loading-sm" />}
                  Обрати
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
