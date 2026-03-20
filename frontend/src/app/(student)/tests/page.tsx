'use client'

import { useEffect, useState } from 'react'
import {
  ClipboardCheck, Clock, Target, TrendingUp, ChevronRight, BookOpen,
  CheckCircle, XCircle, AlertTriangle, BarChart3, BookX, Bookmark, Trophy, Lock,
} from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

interface SavedQuestionItem {
  id: number
  question: {
    id: number
    number: number
    text: string
    image: string | null
    explanation: string | null
    category_name: string | null
    answers: Array<{ id: number; text: string; is_correct: boolean }>
  }
  created_at: string
}

interface Category {
  id: number
  name: string
  slug: string
  question_count: number
}

interface CategoryStat {
  category_id: number
  category_name: string
  attempts: number
  correct: number
  wrong: number
  total: number
  percent: number
}

interface Stats {
  total_attempts: number
  total_correct: number
  total_wrong: number
  total_questions: number
  avg_percent: number
  passed_count: number
  failed_count: number
  by_category: CategoryStat[]
}

interface WrongAnswer {
  question_id: number
  question_number: number
  question_text: string
  question_image: string | null
  explanation: string | null
  category_name: string | null
  selected_answer_id: number | null
  answers: Array<{ id: number; text: string; is_correct: boolean }>
}

type Tab = 'modes' | 'stats' | 'mistakes' | 'saved'

export default function TestsPage() {
  const user = useAuthStore(s => s.user)
  const isPaid = user?.is_paid ?? false
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([])
  const [wrongLoading, setWrongLoading] = useState(false)
  const [wrongLoaded, setWrongLoaded] = useState(false)
  const [savedItems, setSavedItems] = useState<SavedQuestionItem[]>([])
  const [savedLoading, setSavedLoading] = useState(false)
  const [savedLoaded, setSavedLoaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('modes')

  useEffect(() => {
    const promises: Promise<unknown>[] = [
      api.get('/tests/categories/').then(r => r.data),
    ]
    if (isPaid) {
      promises.push(api.get('/tests/stats/').then(r => r.data).catch(() => null))
    } else {
      promises.push(Promise.resolve(null))
    }
    Promise.all(promises).then(([cats, st]) => {
      setCategories(cats as Category[])
      setStats(st as Stats | null)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const loadWrongAnswers = () => {
    if (wrongLoaded) return
    setWrongLoading(true)
    api.get('/tests/wrong-answers/')
      .then(res => {
        setWrongAnswers(res.data.results)
        setWrongLoaded(true)
      })
      .catch(() => {})
      .finally(() => setWrongLoading(false))
  }

  const loadSavedQuestions = () => {
    if (savedLoaded) return
    setSavedLoading(true)
    api.get('/tests/saved/list/')
      .then(res => {
        setSavedItems(res.data.results)
        setSavedLoaded(true)
      })
      .catch(() => {})
      .finally(() => setSavedLoading(false))
  }

  const removeSaved = (questionId: number) => {
    api.post('/tests/saved/', { question_id: questionId })
      .then(() => {
        setSavedItems(prev => prev.filter(s => s.question.id !== questionId))
      })
      .catch(() => {})
  }

  const handleTabChange = (t: Tab) => {
    setTab(t)
    if (t === 'mistakes' && !wrongLoaded) loadWrongAnswers()
    if (t === 'saved' && !savedLoaded) loadSavedQuestions()
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Тести ПДР</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const hasStats = stats && stats.total_attempts > 0

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Тести ПДР</h1>
          <p className="text-base-content/60 text-sm mt-1">Тренуйтесь та перевіряйте свої знання</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-none">
        <TabButton active={tab === 'modes'} onClick={() => handleTabChange('modes')} icon={<ClipboardCheck className="w-4 h-4" />} label="Тести" />
        {isPaid && (
          <>
            <TabButton
              active={tab === 'stats'}
              onClick={() => handleTabChange('stats')}
              icon={<BarChart3 className="w-4 h-4" />}
              label="Статистика"
              badge={hasStats ? `${stats.avg_percent}%` : undefined}
              badgeColor="badge-primary"
            />
            <TabButton
              active={tab === 'mistakes'}
              onClick={() => handleTabChange('mistakes')}
              icon={<BookX className="w-4 h-4" />}
              label="Помилки"
              badge={hasStats && stats.total_wrong > 0 ? String(stats.total_wrong) : undefined}
              badgeColor="badge-error"
            />
            <TabButton
              active={tab === 'saved'}
              onClick={() => handleTabChange('saved')}
              icon={<Bookmark className="w-4 h-4" />}
              label="Збережені"
            />
          </>
        )}
      </div>

      {/* === TAB: Modes === */}
      {tab === 'modes' && (
        <>
          {/* Test modes */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <Link href="/tests/exam" className="card bg-base-100 border border-base-300/60 hover:border-error/40 hover:shadow-md transition-all">
              <div className="card-body p-5">
                <div className="w-12 h-12 rounded-xl bg-error/10 text-error flex items-center justify-center mb-2">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="font-semibold">Екзамен</h3>
                <p className="text-sm text-base-content/60">20 питань, 20 хвилин. Як у сервісному центрі.</p>
              </div>
            </Link>

            {isPaid ? (
              <Link href="/tests/marathon" className="card bg-base-100 border border-base-300/60 hover:border-accent/40 hover:shadow-md transition-all">
                <div className="card-body p-5">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-2">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold">Марафон</h3>
                  <p className="text-sm text-base-content/60">Без обмежень часу. Тренування з поясненнями.</p>
                </div>
              </Link>
            ) : (
              <div className="card bg-base-100 border border-base-300/60 opacity-60">
                <div className="card-body p-5">
                  <div className="w-12 h-12 rounded-xl bg-base-200 text-base-content/30 flex items-center justify-center mb-2">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold">Марафон</h3>
                  <p className="text-sm text-base-content/60">Доступний після оплати</p>
                </div>
              </div>
            )}

            <Link href="/tests/history" className="card bg-base-100 border border-base-300/60 hover:border-primary/40 hover:shadow-md transition-all">
              <div className="card-body p-5">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-semibold">Мої результати</h3>
                <p className="text-sm text-base-content/60">
                  {hasStats
                    ? `${stats.total_attempts} спроб, ${stats.avg_percent}% правильних`
                    : 'Історія ваших спроб'
                  }
                </p>
              </div>
            </Link>
          </div>

          {/* Leaderboard link */}
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

          {/* Topics */}
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
            <>
              <div className={`space-y-1.5 ${!isPaid ? 'opacity-50 pointer-events-none' : ''}`}>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/tests/topic/${cat.id}`}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-base-100 border border-base-300/60 hover:border-primary/30 hover:bg-primary/5 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                      <Target className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{cat.name}</p>
                      <p className="text-xs text-base-content/50">{cat.question_count} питань</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-base-content/20 group-hover:text-primary/60 transition-colors flex-shrink-0" />
                  </Link>
                ))}
              </div>
              {!isPaid && (
                <div className="mt-4 text-center">
                  <Link href="/payments" className="btn btn-warning btn-sm">Оформити підписку</Link>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* === TAB: Stats === */}
      {tab === 'stats' && (
        <>
          {!hasStats ? (
            <div className="card bg-base-100 border border-base-300/60">
              <div className="card-body items-center text-center py-12">
                <BarChart3 className="w-12 h-12 text-base-content/20 mb-3" />
                <p className="text-base-content/50 mb-2">Ви ще не проходили тести</p>
                <p className="text-sm text-base-content/40">Пройдіть хоча б один тест, щоб побачити статистику</p>
              </div>
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <div className="card bg-base-100 border border-base-300/60 p-4">
                  <p className="text-2xl font-bold">{stats.total_attempts}</p>
                  <p className="text-xs text-base-content/50">Тестів пройдено</p>
                </div>
                <div className="card bg-base-100 border border-base-300/60 p-4">
                  <p className="text-2xl font-bold text-primary">{stats.avg_percent}%</p>
                  <p className="text-xs text-base-content/50">Середній результат</p>
                </div>
                <div className="card bg-base-100 border border-base-300/60 p-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-success">{stats.total_correct}</span>
                    <span className="text-sm text-base-content/30">/ {stats.total_questions}</span>
                  </div>
                  <p className="text-xs text-base-content/50">Правильних</p>
                </div>
                <div className="card bg-base-100 border border-base-300/60 p-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-error">{stats.total_wrong}</span>
                    <span className="text-sm text-base-content/30">/ {stats.total_questions}</span>
                  </div>
                  <p className="text-xs text-base-content/50">Неправильних</p>
                </div>
              </div>

              {/* Pass/fail ratio */}
              <div className="card bg-base-100 border border-base-300/60 p-5 mb-6">
                <h3 className="font-semibold text-sm mb-3">Результати тестів</h3>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm">Складено: <strong>{stats.passed_count}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-error" />
                    <span className="text-sm">Не складено: <strong>{stats.failed_count}</strong></span>
                  </div>
                </div>
                <div className="w-full bg-base-300/50 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-success rounded-full transition-all"
                    style={{ width: `${stats.total_attempts > 0 ? Math.round(stats.passed_count / stats.total_attempts * 100) : 0}%` }}
                  />
                </div>
              </div>

              {/* By category */}
              {stats.by_category.length > 0 && (
                <div className="card bg-base-100 border border-base-300/60 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="font-semibold text-sm">Результати за темами</h3>
                    <span className="text-xs text-base-content/40">(слабкі теми зверху)</span>
                  </div>
                  <div className="space-y-3">
                    {stats.by_category.map(cat => {
                      const isWeak = cat.percent < 70
                      const isMedium = cat.percent >= 70 && cat.percent < 85
                      return (
                        <div key={cat.category_id}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              {isWeak && <AlertTriangle className="w-3.5 h-3.5 text-error flex-shrink-0" />}
                              <span className={`text-sm truncate ${isWeak ? 'text-error font-medium' : ''}`}>
                                {cat.category_name}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                              <span className="text-xs text-base-content/40">
                                {cat.correct}/{cat.total}
                              </span>
                              <span className={`text-sm font-semibold min-w-[3rem] text-right ${
                                isWeak ? 'text-error' : isMedium ? 'text-warning' : 'text-success'
                              }`}>
                                {cat.percent}%
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-base-300/50 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isWeak ? 'bg-error' : isMedium ? 'bg-warning' : 'bg-success'
                              }`}
                              style={{ width: `${cat.percent}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* === TAB: Mistakes === */}
      {tab === 'mistakes' && (
        <>
          {wrongLoading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          ) : wrongAnswers.length === 0 ? (
            <div className="card bg-base-100 border border-base-300/60">
              <div className="card-body items-center text-center py-12">
                <CheckCircle className="w-12 h-12 text-success/30 mb-3" />
                <p className="text-base-content/50 mb-1">Помилок немає</p>
                <p className="text-sm text-base-content/40">Ви відповіли правильно на всі питання</p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-base-content/50 mb-4">
                {wrongAnswers.length} питань, на які ви відповіли неправильно. Розберіть кожне.
              </p>
              <div className="space-y-3">
                {wrongAnswers.map(wa => (
                  <div key={wa.question_id} className="card bg-base-100 border border-error/15 p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-xs font-mono text-base-content/30 mt-0.5">#{wa.question_number}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium mb-1">{wa.question_text}</p>
                        {wa.category_name && (
                          <span className="badge badge-ghost badge-sm">{wa.category_name}</span>
                        )}
                      </div>
                    </div>

                    {wa.question_image && (
                      <img src={wa.question_image} alt="" className="rounded-lg mb-3 max-h-48 object-contain" />
                    )}

                    <div className="space-y-1.5 mb-3">
                      {wa.answers.map(ans => {
                        const isSelected = ans.id === wa.selected_answer_id
                        const isCorrect = ans.is_correct
                        let cls = 'flex items-start gap-2 text-sm py-1.5 px-3 rounded-lg '
                        if (isCorrect) cls += 'bg-success/10 text-success'
                        else if (isSelected) cls += 'bg-error/10 text-error'
                        else cls += 'text-base-content/50'

                        return (
                          <div key={ans.id} className={cls}>
                            {isCorrect ? (
                              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            ) : isSelected ? (
                              <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            ) : (
                              <div className="w-4 h-4 flex-shrink-0" />
                            )}
                            <span>{ans.text}</span>
                          </div>
                        )
                      })}
                    </div>

                    {wa.explanation && (
                      <div className="bg-base-200/50 rounded-lg p-3">
                        <p className="text-xs text-base-content/60 leading-relaxed">{wa.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* === TAB: Saved === */}
      {tab === 'saved' && (
        <>
          {savedLoading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          ) : savedItems.length === 0 ? (
            <div className="card bg-base-100 border border-base-300/60">
              <div className="card-body items-center text-center py-12">
                <Bookmark className="w-12 h-12 text-base-content/20 mb-3" />
                <p className="text-base-content/50 mb-1">Збережених питань немає</p>
                <p className="text-sm text-base-content/40">Натисніть на закладку біля питання, щоб зберегти його</p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-base-content/50 mb-4">
                {savedItems.length} збережених питань
              </p>
              <div className="space-y-3">
                {savedItems.map(item => (
                  <div key={item.id} className="card bg-base-100 border border-primary/15 p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-xs font-mono text-base-content/30 mt-0.5">#{item.question.number}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium mb-1">{item.question.text}</p>
                        {item.question.category_name && (
                          <span className="badge badge-ghost badge-sm">{item.question.category_name}</span>
                        )}
                      </div>
                      <button
                        onClick={() => removeSaved(item.question.id)}
                        className="btn btn-ghost btn-xs"
                        title="Прибрати з збережених"
                      >
                        <Bookmark className="w-4 h-4 fill-primary text-primary" />
                      </button>
                    </div>

                    {item.question.image && (
                      <img src={item.question.image} alt="" className="rounded-lg mb-3 max-h-48 object-contain" />
                    )}

                    <div className="space-y-1.5 mb-3">
                      {item.question.answers.map(ans => {
                        let cls = 'flex items-start gap-2 text-sm py-1.5 px-3 rounded-lg '
                        if (ans.is_correct) cls += 'bg-success/10 text-success'
                        else cls += 'text-base-content/50'

                        return (
                          <div key={ans.id} className={cls}>
                            {ans.is_correct ? (
                              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            ) : (
                              <div className="w-4 h-4 flex-shrink-0" />
                            )}
                            <span>{ans.text}</span>
                          </div>
                        )
                      })}
                    </div>

                    {item.question.explanation && (
                      <div className="bg-base-200/50 rounded-lg p-3">
                        <p className="text-xs text-base-content/60 leading-relaxed">{item.question.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  badge,
  badgeColor,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  badge?: string
  badgeColor?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
        active
          ? 'bg-primary text-primary-content shadow-sm'
          : 'bg-base-100 border border-base-300/60 text-base-content/70 hover:bg-base-200'
      }`}
    >
      {icon}
      {label}
      {badge && (
        <span className={`badge badge-xs ${active ? 'badge-ghost bg-white/20 text-white border-0' : badgeColor}`}>
          {badge}
        </span>
      )}
    </button>
  )
}
