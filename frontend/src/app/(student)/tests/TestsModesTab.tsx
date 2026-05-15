'use client'

import { useState } from 'react'
import { ChevronRight, ClipboardCheck, Flame, Loader2, Lock, Trophy } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { TopicMultiSelect } from '@/components/testing/TopicMultiSelect'
import type { TestCategory, TestStats } from '@/types/testing'

interface StartTestResponse {
  attempt_id: number
  [key: string]: unknown
}

export function TestsModesTab({
  categories,
  isPaid,
  hasStats,
  stats,
}: {
  categories: TestCategory[]
  isPaid: boolean
  hasStats: boolean
  stats: TestStats | null
}) {
  const router = useRouter()
  const [startingHard, setStartingHard] = useState(false)
  const [hardError, setHardError] = useState<string | null>(null)

  const startHardTest = async () => {
    if (!isPaid || startingHard) return

    setStartingHard(true)
    setHardError(null)

    try {
      const res = await api.post<StartTestResponse>('/tests/start/', { test_type: 'hard' })
      sessionStorage.setItem(`test_${res.data.attempt_id}`, JSON.stringify(res.data))
      router.push(`/tests/session/${res.data.attempt_id}`)
    } catch {
      setHardError('Не вдалося розпочати тест. Спробуйте ще раз.')
      setStartingHard(false)
    }
  }

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/tests/exam" className="group relative overflow-hidden card bg-gradient-to-br from-red-50 to-base-100 border-2 border-red-200/60 hover:border-red-400/60 hover:shadow-lg transition-all">
          <div className="absolute -top-3 -right-3 opacity-[0.07]" aria-hidden>
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
              <polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" fill="currentColor" stroke="currentColor" strokeWidth="4" className="text-red-500" />
            </svg>
          </div>
          <div className="card-body p-5 relative">
            <div className="flex items-center gap-3 mb-3">
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none" className="flex-shrink-0">
                <polygon points="13,3 31,3 41,13 41,31 31,41 13,41 3,31 3,13" fill="#fee2e2" stroke="#ef4444" strokeWidth="2.5" />
                <text x="22" y="27" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#dc2626">20</text>
              </svg>
              <div>
                <h3 className="font-bold text-base">Екзамен</h3>
                <span className="text-xs text-error/70 font-medium">20 хв</span>
              </div>
            </div>
            <p className="text-sm text-base-content/60">20 питань, 20 хвилин. Як у сервісному центрі.</p>
          </div>
        </Link>

        {isPaid ? (
          <Link href="/tests/marathon" className="group relative overflow-hidden card bg-gradient-to-br from-amber-50 to-base-100 border-2 border-amber-200/60 hover:border-amber-400/60 hover:shadow-lg transition-all">
            <div className="absolute -top-2 -right-2 opacity-[0.07]" aria-hidden>
              <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
                <rect x="15" y="15" width="42" height="42" rx="5" transform="rotate(45, 36, 36)" fill="currentColor" className="text-amber-500" />
              </svg>
            </div>
            <div className="card-body p-5 relative">
              <div className="flex items-center gap-3 mb-3">
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none" className="flex-shrink-0">
                  <rect x="6" y="6" width="22" height="22" rx="3" transform="rotate(45, 17, 17)" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2.5" />
                  <text x="22" y="28" textAnchor="middle" fontSize="20" fill="#d97706">&#8734;</text>
                </svg>
                <div>
                  <h3 className="font-bold text-base">Марафон</h3>
                  <span className="text-xs text-amber-600/70 font-medium">без ліміту</span>
                </div>
              </div>
              <p className="text-sm text-base-content/60">Без обмежень часу. Тренування з поясненнями.</p>
            </div>
          </Link>
        ) : (
          <LockedModeCard title="Марафон" />
        )}

        {isPaid ? (
          <div className="group relative overflow-hidden card bg-gradient-to-br from-orange-50 to-base-100 border-2 border-orange-200/60 hover:border-orange-400/60 hover:shadow-lg transition-all">
            <div className="absolute -top-2 -right-2 opacity-[0.07]" aria-hidden>
              <Flame className="w-24 h-24 text-orange-500" strokeWidth={1.5} />
            </div>
            <div className="card-body p-5 relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 border border-orange-200">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">100 складних питань</h3>
                  <span className="text-xs text-orange-600/70 font-medium">без ліміту</span>
                </div>
              </div>
              <p className="text-sm text-base-content/60">Найскладніші питання, відібрані адміністратором</p>
              <button
                type="button"
                className="btn btn-sm btn-warning mt-4 w-full"
                onClick={startHardTest}
                disabled={startingHard}
              >
                {startingHard && <Loader2 className="w-4 h-4 animate-spin" />}
                Розпочати
              </button>
              {hardError && (
                <p className="text-xs text-error mt-2">{hardError}</p>
              )}
            </div>
          </div>
        ) : (
          <LockedModeCard title="100 складних питань" />
        )}

        <Link href="/tests/history" className="group relative overflow-hidden card bg-gradient-to-br from-emerald-50 to-base-100 border-2 border-emerald-200/60 hover:border-emerald-400/60 hover:shadow-lg transition-all">
          <div className="absolute -top-3 -right-3 opacity-[0.07]" aria-hidden>
            <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
              <circle cx="45" cy="45" r="40" fill="currentColor" className="text-emerald-500" />
            </svg>
          </div>
          <div className="card-body p-5 relative">
            <div className="flex items-center gap-3 mb-3">
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none" className="flex-shrink-0">
                <circle cx="22" cy="22" r="19" fill="#d1fae5" stroke="#10b981" strokeWidth="2.5" />
                <path d="M14 22 L19 27 L30 16" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
              <div>
                <h3 className="font-bold text-base">Мої результати</h3>
                <span className="text-xs text-emerald-600/70 font-medium">
                  {hasStats && stats ? `${stats.avg_percent}% правильних` : 'історія'}
                </span>
              </div>
            </div>
            <p className="text-sm text-base-content/60">
              {hasStats && stats ? `${stats.total_attempts} спроб пройдено` : 'Історія ваших спроб'}
            </p>
          </div>
        </Link>
      </div>

      {isPaid ? (
        <Link
          href="/tests/leaderboard"
          className="flex items-center gap-3 p-3.5 rounded-xl bg-base-100 border border-base-300/60 hover:border-warning/30 hover:bg-warning/5 transition-colors group mb-8"
        >
          <div className="w-9 h-9 rounded-lg bg-warning/10 text-warning flex items-center justify-center flex-shrink-0">
            <Trophy className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Рейтинг</p>
            <p className="text-xs text-base-content/50">Топ-50 учнів за кількістю правильних відповідей</p>
          </div>
          <ChevronRight className="w-4 h-4 text-base-content/20 group-hover:text-warning/60 transition-colors flex-shrink-0" />
        </Link>
      ) : (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-base-100 border border-base-300/60 opacity-60 mb-8">
          <div className="w-9 h-9 rounded-lg bg-base-200 text-base-content/30 flex items-center justify-center flex-shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Рейтинг</p>
            <p className="text-xs text-base-content/50">Доступний після оплати</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold">За темами</h2>
        {!isPaid && <Lock className="w-4 h-4 text-warning" />}
      </div>
      {categories.length === 0 ? (
        <div className="card bg-base-100 border border-base-300/60">
          <div className="card-body items-center text-center py-12">
            <ClipboardCheck className="w-12 h-12 text-base-content/20 mb-3" />
            <p className="text-base-content/50">Питання ще не завантажено</p>
          </div>
        </div>
      ) : (
        <TopicMultiSelect categories={categories} isPaid={isPaid} />
      )}
    </>
  )
}

function LockedModeCard({ title }: { title: string }) {
  return (
    <div className="relative overflow-hidden card bg-base-100 border border-base-300/60 opacity-60">
      <div className="card-body p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-lg bg-base-200 text-base-content/30 flex items-center justify-center flex-shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base">{title}</h3>
            <span className="text-xs text-base-content/40">після оплати</span>
          </div>
        </div>
        <p className="text-sm text-base-content/60">Доступний після оплати</p>
      </div>
    </div>
  )
}
