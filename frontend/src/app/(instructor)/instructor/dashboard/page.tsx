'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle, CreditCard, FileText, User, XCircle } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import {
  createMyInstructorProfile,
  getMyInstructorProfile,
  getMySubscription,
} from '@/lib/api/instructors'
import type { InstructorProfile, InstructorSubscription } from '@/types/instructors'

function subscriptionState(subscription: InstructorSubscription | null) {
  if (!subscription) return { label: 'Підписки немає', className: 'badge-ghost', note: 'Оберіть тариф, щоб профіль міг бути опублікований.' }
  if (subscription.payment_status === 'pending') return { label: 'Очікує підтвердження', className: 'badge-warning', note: 'Адміністратор підтвердить підписку після перевірки.' }
  if (subscription.is_active && subscription.payment_status === 'paid') return { label: 'Активна', className: 'badge-success', note: `Дійсна до ${new Date(subscription.expires_at).toLocaleDateString('uk-UA')}.` }
  return { label: 'Неактивна', className: 'badge-error', note: 'Оберіть новий тариф або зверніться до адміністратора.' }
}

function verificationState(profile: InstructorProfile) {
  if (profile.is_verified) return { label: 'Підтверджено', className: 'badge-success', icon: CheckCircle, note: 'Профіль перевірено адміністратором.' }
  if (profile.verification_note.trim()) return { label: 'Відхилено', className: 'badge-error', icon: XCircle, note: profile.verification_note }
  return { label: 'На перевірці', className: 'badge-warning', icon: AlertCircle, note: 'Заповніть профіль і документи, щоб адміністратор міг завершити перевірку.' }
}

export default function InstructorDashboardPage() {
  const router = useRouter()
  const toast = useToast()
  const [profile, setProfile] = useState<InstructorProfile | null>(null)
  const [subscription, setSubscription] = useState<InstructorSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    Promise.all([getMyInstructorProfile(), getMySubscription()])
      .then(([profileData, subscriptionData]) => {
        setProfile(profileData)
        setSubscription(subscriptionData)
      })
      .catch(() => toast.add('Не вдалося завантажити кабінет', 'error'))
      .finally(() => setLoading(false))
  }, [toast])

  const checklist = useMemo(() => {
    if (!profile) return []
    const hasBase = Boolean(profile.car_model && profile.description && profile.price_per_hour)
    const hasPhotos = Boolean(profile.photo && profile.car_photo)
    const hasDocs = Boolean(profile.certificate_photo && profile.vin_code && profile.tech_passport)
    const hasActiveSub = Boolean(subscription?.is_active && subscription.payment_status === 'paid')
    return [
      { label: 'Основні дані та ціна заповнені', done: hasBase, href: '/instructor/profile', icon: User },
      { label: 'Фото профілю та авто додані', done: hasPhotos, href: '/instructor/profile', icon: User },
      { label: 'Документи авто завантажені', done: hasDocs, href: '/instructor/documents', icon: FileText },
      { label: 'Профіль підтверджено і підписка активна', done: profile.is_verified && hasActiveSub, href: '/instructor/subscription', icon: CreditCard },
    ]
  }, [profile, subscription])

  const handleCreate = async () => {
    setCreating(true)
    try {
      await createMyInstructorProfile()
      router.push('/instructor/profile')
    } catch {
      toast.add('Не вдалося створити профіль', 'error')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-md text-warning" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Кабінет інструктора</h1>
          <p className="text-base-content/60 text-sm mt-1">Створіть профіль, щоб заповнити дані для публікації.</p>
        </div>
        <div className="card bg-base-100 border border-base-300/60">
          <div className="card-body p-6">
            <h2 className="card-title text-lg">Профіль ще не створено</h2>
            <p className="text-sm text-base-content/60">Після створення ви зможете додати фото, авто, документи і підписку.</p>
            <div className="card-actions mt-4">
              <button onClick={handleCreate} disabled={creating} className="btn btn-warning">
                {creating && <span className="loading loading-spinner loading-sm" />}
                Створити профіль
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const verification = verificationState(profile)
  const VerificationIcon = verification.icon
  const sub = subscriptionState(subscription)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Головна</h1>
        <p className="text-base-content/60 text-sm mt-1">Стан профілю, перевірки та публікації.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <div className="card bg-base-100 border border-base-300/60">
          <div className="card-body p-5">
            <div className="flex items-start gap-3">
              <VerificationIcon className="w-5 h-5 text-warning mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-semibold">Перевірка профілю</h2>
                  <span className={`badge ${verification.className}`}>{verification.label}</span>
                </div>
                <p className="text-sm text-base-content/60 mt-2">{verification.note}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300/60">
          <div className="card-body p-5">
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-warning mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-semibold">Підписка</h2>
                  <span className={`badge ${sub.className}`}>{sub.label}</span>
                </div>
                <p className="text-sm text-base-content/60 mt-2">{sub.note}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 border border-base-300/60">
        <div className="card-body p-5">
          <h2 className="font-semibold mb-3">Готовність до публікації</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {checklist.map((item) => (
              <button key={item.label} onClick={() => router.push(item.href)} className="flex items-center gap-3 p-3 rounded-xl border border-base-300/60 text-left hover:border-warning/40 transition-colors">
                <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${item.done ? 'bg-success/10 text-success' : 'bg-base-200 text-base-content/40'}`}>
                  {item.done ? <CheckCircle className="w-5 h-5" /> : <item.icon className="w-5 h-5" />}
                </span>
                <span className="flex-1 text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
