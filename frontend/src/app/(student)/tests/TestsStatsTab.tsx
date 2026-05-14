'use client'

import { useState } from 'react'
import { AlertTriangle, BarChart3, CheckCircle, Trophy, XCircle } from 'lucide-react'
import Link from 'next/link'
import { PaywallOverlay } from '@/components/ui/PaywallBanner'
import type { TestCategoryStat, TestStats } from '@/types/testing'

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

export function TestsStatsTab({
  stats,
  isPaid,
}: {
  stats: TestStats | null
  isPaid: boolean
}) {
  const resolvedStats = stats ?? EMPTY_STATS

  if (!isPaid) {
    return (
      <PaywallOverlay message="Доступно в платній версії">
        <StatsContent stats={resolvedStats} />
      </PaywallOverlay>
    )
  }

  return <StatsContent stats={resolvedStats} />
}

function StatsContent({ stats }: { stats: TestStats }) {
  const [showWrongOnly, setShowWrongOnly] = useState(false)
  const visibleCategories = showWrongOnly
    ? stats.by_category.filter((category) => category.wrong > 0)
    : stats.by_category

  return (
    <div className="space-y-5">
      <div className="card bg-base-100 border border-base-300/60">
        <div className="card-body p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <BarChart3 className="w-4.5 h-4.5 text-primary" />
                Загальний прогрес
              </h3>
              <progress
                className="progress progress-primary w-full"
                value={stats.overall_progress_percent}
                max={100}
              />
              <p className="text-sm text-base-content/60 mt-2">
                Опрацьовано {stats.unique_questions_answered}/{stats.total_pool_questions} питань ({stats.overall_progress_percent}%)
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/achievements" className="badge badge-warning gap-1.5 py-3 px-3">
                <Trophy className="w-4 h-4" />
                {stats.achievements_earned}/{stats.achievements_total}
              </Link>
              {stats.weakest_topic ? (
                <Link
                  href={`/tests/topic/${stats.weakest_topic.category_id}`}
                  className="btn btn-primary btn-sm"
                >
                  Продовжити навчання
                </Link>
              ) : (
                <button type="button" className="btn btn-primary btn-sm" disabled>
                  Продовжити навчання
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Тестів пройдено" value={String(stats.total_attempts)} />
        <StatCard label="Середній результат" value={`${stats.avg_percent}%`} />
        <StatCard label="Правильних" value={`${stats.total_correct}/${stats.total_questions}`} tone="success" />
        <StatCard label="Неправильних" value={`${stats.total_wrong}/${stats.total_questions}`} tone="error" />
      </div>

      <div className="card bg-base-100 border border-base-300/60 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h3 className="font-semibold text-sm">Результати за темами</h3>
            <p className="text-xs text-base-content/40">Слабкі теми зверху</p>
          </div>
          <label className="label cursor-pointer justify-start gap-3 p-0">
            <input
              type="checkbox"
              className="toggle toggle-error toggle-sm"
              checked={showWrongOnly}
              onChange={(event) => setShowWrongOnly(event.target.checked)}
            />
            <span className="label-text">Показати тільки з помилками</span>
          </label>
        </div>

        {visibleCategories.length === 0 ? (
          <p className="text-sm text-base-content/50">Немає тем для показу</p>
        ) : (
          <div className="space-y-3">
            {visibleCategories.map((category) => (
              <CategoryRow key={category.category_id} category={category} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
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
    <div className="card bg-base-100 border border-base-300/60 p-4">
      <p className={`text-2xl font-bold ${toneClass}`}>{value}</p>
      <p className="text-xs text-base-content/50">{label}</p>
    </div>
  )
}

function CategoryRow({ category }: { category: TestCategoryStat }) {
  const isWeak = category.percent < 70 && category.total > 0
  const isMedium = category.percent >= 70 && category.percent < 85

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-2 min-w-0">
          {isWeak ? (
            <AlertTriangle className="w-3.5 h-3.5 text-error flex-shrink-0" />
          ) : category.total > 0 ? (
            <CheckCircle className="w-3.5 h-3.5 text-success flex-shrink-0" />
          ) : (
            <XCircle className="w-3.5 h-3.5 text-base-content/20 flex-shrink-0" />
          )}
          <span className={`text-sm truncate ${isWeak ? 'text-error font-medium' : ''}`}>
            {category.category_name}
          </span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-base-content/40">
            {category.unique_answered}/{category.total_in_topic}
          </span>
          <span className={`text-sm font-semibold min-w-[3rem] text-right ${
            isWeak ? 'text-error' : isMedium ? 'text-warning' : 'text-success'
          }`}>
            {category.percent}%
          </span>
        </div>
      </div>
      <div className="w-full bg-base-300/50 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${category.completion_percent}%` }}
        />
      </div>
      <p className="text-[11px] text-base-content/40 mt-1">
        Прогрес теми {category.completion_percent}%, правильних {category.unique_correct}
      </p>
    </div>
  )
}
