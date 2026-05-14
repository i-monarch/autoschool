'use client'

import { useEffect, useState } from 'react'
import { BarChart3, Bookmark, BookX, ClipboardCheck } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import type { SavedQuestionItem, TestCategory, TestStats, WrongAnswer } from '@/types/testing'
import { TestsMistakesTab } from './TestsMistakesTab'
import { TestsModesTab } from './TestsModesTab'
import { TestsSavedTab } from './TestsSavedTab'
import { TestsStatsTab } from './TestsStatsTab'

type Tab = 'modes' | 'stats' | 'mistakes' | 'saved'

export default function TestsPage() {
  const user = useAuthStore((state) => state.user)
  const isPaid = user?.is_paid ?? false
  const [categories, setCategories] = useState<TestCategory[]>([])
  const [stats, setStats] = useState<TestStats | null>(null)
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([])
  const [wrongLoading, setWrongLoading] = useState(false)
  const [wrongLoaded, setWrongLoaded] = useState(false)
  const [savedItems, setSavedItems] = useState<SavedQuestionItem[]>([])
  const [savedLoading, setSavedLoading] = useState(false)
  const [savedLoaded, setSavedLoaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('modes')

  useEffect(() => {
    Promise.all([
      api.get<TestCategory[]>('/tests/categories/').then((response) => response.data),
      api.get<TestStats>('/tests/stats/').then((response) => response.data).catch(() => null),
    ]).then(([loadedCategories, loadedStats]) => {
      setCategories(loadedCategories)
      setStats(loadedStats)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const loadWrongAnswers = () => {
    if (wrongLoaded) return
    setWrongLoading(true)
    api.get<{ results: WrongAnswer[] }>('/tests/wrong-answers/')
      .then((response) => {
        setWrongAnswers(response.data.results)
        setWrongLoaded(true)
      })
      .catch(() => {})
      .finally(() => setWrongLoading(false))
  }

  const loadSavedQuestions = () => {
    if (savedLoaded) return
    setSavedLoading(true)
    api.get<{ results: SavedQuestionItem[] }>('/tests/saved/list/')
      .then((response) => {
        setSavedItems(response.data.results)
        setSavedLoaded(true)
      })
      .catch(() => {})
      .finally(() => setSavedLoading(false))
  }

  const removeSaved = (questionId: number) => {
    api.post('/tests/saved/', { question_id: questionId })
      .then(() => {
        setSavedItems((current) => current.filter((item) => item.question.id !== questionId))
      })
      .catch(() => {})
  }

  const handleTabChange = (nextTab: Tab) => {
    setTab(nextTab)
    if (nextTab === 'mistakes' && !wrongLoaded) loadWrongAnswers()
    if (nextTab === 'saved' && !savedLoaded) loadSavedQuestions()
  }

  const licenseCategories = user?.license_categories?.length ? user.license_categories : ['B']
  const hasStats = Boolean(stats && stats.total_attempts > 0)

  if (loading) {
    return (
      <div>
        <LicenseInfoBar categories={licenseCategories} />
        <h1 className="text-2xl font-bold mb-6">Тести ПДР</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="skeleton h-32 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <LicenseInfoBar categories={licenseCategories} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Тести ПДР</h1>
        <p className="text-base-content/60 text-sm mt-1">Тренуйтесь та перевіряйте свої знання</p>
      </div>

      <div className="tabs tabs-bordered mb-6">
        <TabButton active={tab === 'modes'} onClick={() => handleTabChange('modes')}>
          <ClipboardCheck className="w-4 h-4 mr-2" />
          Тести
        </TabButton>
        <TabButton active={tab === 'stats'} onClick={() => handleTabChange('stats')}>
          <BarChart3 className="w-4 h-4 mr-2" />
          Статистика
          {hasStats && stats && (
            <span className="badge badge-sm badge-info ml-2">{stats.avg_percent}%</span>
          )}
        </TabButton>
        <TabButton active={tab === 'mistakes'} onClick={() => handleTabChange('mistakes')}>
          <BookX className="w-4 h-4 mr-2" />
          Помилки
          {hasStats && stats && stats.total_wrong > 0 && (
            <span className="badge badge-sm badge-error ml-2">{stats.total_wrong}</span>
          )}
        </TabButton>
        <TabButton active={tab === 'saved'} onClick={() => handleTabChange('saved')}>
          <Bookmark className="w-4 h-4 mr-2" />
          Збережені
        </TabButton>
      </div>

      {tab === 'modes' && (
        <TestsModesTab
          categories={categories}
          isPaid={isPaid}
          hasStats={hasStats}
          stats={stats}
        />
      )}
      {tab === 'stats' && <TestsStatsTab stats={stats} isPaid={isPaid} />}
      {tab === 'mistakes' && (
        <TestsMistakesTab
          isPaid={isPaid}
          loading={wrongLoading}
          wrongAnswers={wrongAnswers}
        />
      )}
      {tab === 'saved' && (
        <TestsSavedTab
          isPaid={isPaid}
          loading={savedLoading}
          savedItems={savedItems}
          onRemoveSaved={removeSaved}
        />
      )}
    </div>
  )
}

function LicenseInfoBar({ categories }: { categories: string[] }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-base-300/60 bg-base-100 px-4 py-3 text-sm">
      <span className="text-base-content/70">Категорії: {categories.join(', ')}</span>
      <Link href="/profile/categories" className="btn btn-ghost btn-xs">
        Змінити
      </Link>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      className={`tab tab-lg ${active ? 'tab-active' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
