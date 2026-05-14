'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Info, Loader2, Play, Target } from 'lucide-react'
import api from '@/lib/api'
import type { TestCategory } from '@/types/testing'

interface TopicMultiSelectProps {
  categories: TestCategory[]
  isPaid: boolean
}

interface StartTestResponse {
  attempt_id: number
  [key: string]: unknown
}

export function TopicMultiSelect({ categories, isPaid }: TopicMultiSelectProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedCount = selectedIds.length
  const allSelected = selectedCount === categories.length

  const toggleTopic = (categoryId: number) => {
    setSelectedIds((current) => (
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId]
    ))
  }

  const startTest = async () => {
    if (!isPaid || selectedIds.length === 0 || starting) return

    setStarting(true)
    setError(null)

    try {
      const res = await api.post<StartTestResponse>('/tests/start/', {
        test_type: 'topic',
        category_ids: selectedIds,
      })
      sessionStorage.setItem(`test_${res.data.attempt_id}`, JSON.stringify(res.data))
      router.push(`/tests/session/${res.data.attempt_id}`)
    } catch {
      setError('Не вдалося розпочати тест. Спробуйте ще раз.')
      setStarting(false)
    }
  }

  return (
    <>
      <div className={!isPaid ? 'opacity-50 pointer-events-none' : ''}>
        <div className="flex items-start gap-3 p-3.5 mb-4 rounded-xl bg-info/5 border border-info/20">
          <Info className="w-4 h-4 text-info flex-shrink-0 mt-0.5" />
          <div className="text-sm text-base-content/70 leading-relaxed">
            Оберіть одну або кілька тем — тест буде складено з питань
            <strong className="text-base-content"> лише обраних тем</strong>.
            З кожної теми береться приблизно однакова кількість питань (випадково),
            потім вони перемішуються. Усього в тесті — до 20 питань.
            Якщо позначите всі — отримаєте випадкові питання з усіх розділів ПДР.
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => setSelectedIds(categories.map((cat) => cat.id))}
            disabled={allSelected}
          >
            Обрати всі
          </button>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => setSelectedIds([])}
            disabled={selectedCount === 0}
          >
            Зняти все
          </button>
        </div>

        <div className="space-y-1.5">
          {categories.map((cat) => {
            const checked = selectedIds.includes(cat.id)

            return (
              <label
                key={cat.id}
                className={`flex items-center gap-3 p-3.5 rounded-xl bg-base-100 border transition-colors cursor-pointer group ${
                  checked
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-base-300/60 hover:border-primary/30 hover:bg-primary/5'
                }`}
              >
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary checkbox-sm flex-shrink-0"
                  checked={checked}
                  onChange={() => toggleTopic(cat.id)}
                />
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <span className="flex-1 min-w-0 text-sm font-medium truncate">{cat.name}</span>
                <span className="text-xs text-base-content/50 flex-shrink-0">{cat.question_count} питань</span>
              </label>
            )
          })}
        </div>

        <div className="sticky bottom-4 z-10 mt-4 rounded-xl bg-base-100/95 border border-base-300/70 shadow-lg backdrop-blur p-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium">Обрано тем: {selectedCount}</p>
              <p className="text-xs text-base-content/50">~ 20 питань</p>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm sm:btn-md"
              disabled={selectedCount === 0 || starting || !isPaid}
              onClick={startTest}
            >
              {starting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Розпочати тест
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-3 text-sm text-error">{error}</p>
        )}
      </div>

      {!isPaid && (
        <div className="mt-4 text-center">
          <Link href="/payments" className="btn btn-warning btn-sm">Оформити підписку</Link>
        </div>
      )}
    </>
  )
}
