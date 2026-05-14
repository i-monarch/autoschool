'use client'

import { useEffect, useRef, useState } from 'react'
import { BarChart3, RotateCcw } from 'lucide-react'
import api from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import type { TestStats } from '@/types/testing'

const EMPTY_STATS: TestStats = {
  total_attempts: 0,
  total_correct: 0,
  total_wrong: 0,
  total_questions: 0,
  avg_percent: 0,
  passed_count: 0,
  failed_count: 0,
  overall_progress_percent: 0,
  unique_questions_answered: 0,
  unique_questions_correct: 0,
  total_pool_questions: 0,
  weakest_topic: null,
  achievements_earned: 0,
  achievements_total: 0,
  by_category: [],
}

export function ProfileStatsCard() {
  const toast = useToast()
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const [stats, setStats] = useState<TestStats>(EMPTY_STATS)
  const [loading, setLoading] = useState(true)
  const [resetting, setResetting] = useState(false)

  const fetchStats = async () => {
    setLoading(true)
    try {
      const { data } = await api.get<TestStats>('/tests/stats/')
      setStats(data)
    } catch {
      setStats(EMPTY_STATS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchStats()
  }, [])

  const handleReset = async () => {
    setResetting(true)
    try {
      await api.post('/tests/stats/reset/')
      toast.add('Статистику скинуто', 'success')
      dialogRef.current?.close()
      await fetchStats()
    } catch {
      toast.add('Не вдалося скинути статистику', 'error')
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="card bg-base-100 border border-base-300/60">
      <div className="card-body p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <BarChart3 className="w-4.5 h-4.5 text-base-content/60" />
            Статистика
          </h2>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-error gap-1.5"
            onClick={() => dialogRef.current?.showModal()}
            disabled={loading || resetting}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Скинути статистику
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <StatTile label="Здано іспитів" value={`${stats.passed_count}/${stats.total_attempts}`} />
          <StatTile label="Середній рахунок" value={`${stats.avg_percent}%`} />
          <StatTile label="Запитань пройдено" value={String(stats.total_questions)} />
          <StatTile label="Правильних" value={String(stats.total_correct)} tone="success" />
          <StatTile label="Неправильних" value={String(stats.total_wrong)} tone="error" />
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-base-content/60">Загальний прогрес</span>
            <span className="font-semibold">{stats.overall_progress_percent}%</span>
          </div>
          <progress
            className="progress progress-primary w-full"
            value={stats.overall_progress_percent}
            max={100}
          />
        </div>
      </div>

      <dialog ref={dialogRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Скинути статистику</h3>
          <p className="py-4">Видалити всі ваші результати тестів?</p>
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => dialogRef.current?.close()}
              disabled={resetting}
            >
              Скасувати
            </button>
            <button
              type="button"
              className="btn btn-error"
              onClick={handleReset}
              disabled={resetting}
            >
              {resetting ? <span className="loading loading-spinner loading-sm" /> : 'Видалити'}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>Закрити</button>
        </form>
      </dialog>
    </div>
  )
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'success' | 'error'
}) {
  const toneClass = tone === 'success' ? 'text-success' : tone === 'error' ? 'text-error' : ''

  return (
    <div className="rounded-lg bg-base-200/50 p-3">
      <p className={`text-xl font-bold ${toneClass}`}>{value}</p>
      <p className="text-xs text-base-content/50 mt-1">{label}</p>
    </div>
  )
}
