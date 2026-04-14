'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle, Flag, AlertCircle, Bookmark, X, LogOut } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

interface AnswerOption {
  id: number
  text: string
  order: number
}

interface Question {
  id: number
  number: number
  text: string
  image: string | null
  answers: AnswerOption[]
}

interface AnswerResult {
  is_correct: boolean
  correct_answer_id: number | null
  explanation: string | null
}

export default function TestSessionPage() {
  const params = useParams()
  const router = useRouter()
  const attemptId = params.attemptId as string

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [testType, setTestType] = useState('')
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [finishing, setFinishing] = useState(false)
  const [showConfirmFinish, setShowConfirmFinish] = useState(false)
  const [showConfirmExit, setShowConfirmExit] = useState(false)
  const [autoAdvance, setAutoAdvance] = useState(false)

  const [answered, setAnswered] = useState<Record<number, {
    selectedId: number | null
    result: AnswerResult | null
  }>>({})
  const [savedQuestions, setSavedQuestions] = useState<Set<number>>(new Set())
  const [savingQuestion, setSavingQuestion] = useState<number | null>(null)

  const user = useAuthStore(s => s.user)
  const isPaid = user?.is_paid ?? false
  const isExamMode = testType === 'exam'

  useEffect(() => {
    const stored = sessionStorage.getItem(`test_${attemptId}`)
    if (!stored) {
      router.push('/tests')
      return
    }
    const data = JSON.parse(stored)
    setQuestions(data.questions)
    setTestType(data.test_type)
    if (data.time_limit_minutes) {
      setSecondsLeft(data.time_limit_minutes * 60)
    }
    setLoading(false)

    if (isPaid) {
      api.get('/tests/saved/list/').then(res => {
        const ids = new Set<number>(res.data.results.map((s: { question: { id: number } }) => s.question.id))
        setSavedQuestions(ids)
      }).catch(() => {})
    }
  }, [attemptId, router])

  const toggleSaveQuestion = async (questionId: number) => {
    if (!isPaid) return
    setSavingQuestion(questionId)
    try {
      const res = await api.post('/tests/saved/', { question_id: questionId })
      setSavedQuestions(prev => {
        const next = new Set(prev)
        if (res.data.saved) next.add(questionId)
        else next.delete(questionId)
        return next
      })
    } catch {} finally {
      setSavingQuestion(null)
    }
  }

  // Timer
  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0) return
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer)
          doFinish()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [secondsLeft !== null])

  const handleAnswer = async (questionId: number, answerId: number) => {
    if (answered[questionId]?.selectedId) return

    try {
      const res = await api.post(`/tests/attempts/${attemptId}/answer/`, {
        question_id: questionId,
        answer_id: answerId,
      })

      setAnswered(prev => ({
        ...prev,
        [questionId]: { selectedId: answerId, result: res.data },
      }))

      if (autoAdvance && currentIndex < questions.length - 1) {
        setTimeout(() => setCurrentIndex(prev => prev + 1), 800)
      }
    } catch {
      // handle error
    }
  }

  const doFinish = async () => {
    if (finishing) return
    setFinishing(true)
    try {
      await api.post(`/tests/attempts/${attemptId}/finish/`)
      sessionStorage.removeItem(`test_${attemptId}`)
      router.push(`/tests/result/${attemptId}`)
    } catch {
      setFinishing(false)
    }
  }

  const handleFinish = () => {
    const unanswered = questions.length - Object.keys(answered).length
    if (unanswered > 0) {
      setShowConfirmFinish(true)
    } else {
      doFinish()
    }
  }

  const currentQuestion = questions[currentIndex]
  const answeredCount = Object.keys(answered).length

  if (loading || !currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  const currentAnswer = answered[currentQuestion.id]
  const showResult = !!currentAnswer?.result
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div>
      {/* Header bar */}
      <div className="sticky top-16 z-20 bg-base-200/80 backdrop-blur-md -mx-4 px-4 py-3 mb-4 border-b border-base-300/40">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setShowConfirmExit(true)}
            className="btn btn-ghost btn-sm btn-square flex-shrink-0"
            title="Вийти з тесту"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-base">
            <span className="font-bold text-lg">{currentIndex + 1}</span>
            <span className="text-base-content/40"> / {questions.length}</span>
          </div>

          {/* Question nav dots */}
          <div className="flex-1 flex flex-wrap gap-1 py-1">
            {questions.map((q, i) => {
              const a = answered[q.id]
              let bg = 'bg-base-300 text-base-content/50'

              if (a?.result?.is_correct) bg = 'bg-success text-success-content'
              else if (a?.result && !a.result.is_correct) bg = 'bg-error text-error-content'
              else if (a?.selectedId) bg = 'bg-primary text-primary-content'

              const isCurrent = i === currentIndex
              if (isCurrent && !a?.result) bg = 'bg-primary text-primary-content ring-2 ring-primary/30'

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-6 h-6 rounded-full flex-shrink-0 transition-colors flex items-center justify-center text-[10px] font-semibold leading-none ${bg}`}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>

          {isExamMode && (
            <div className="badge badge-error font-semibold text-xs px-3 py-3 flex-shrink-0">
              Екзамен
            </div>
          )}

          {testType === 'marathon' && (
            <div className="badge badge-primary font-semibold text-xs px-3 py-3 flex-shrink-0">
              Марафон
            </div>
          )}

          <label className="flex items-center gap-2 cursor-pointer flex-shrink-0" title="Автоперехід до наступного питання">
            <span className="text-xs text-base-content/50">Авто</span>
            <input
              type="checkbox"
              className="toggle toggle-sm toggle-primary"
              checked={autoAdvance}
              onChange={(e) => setAutoAdvance(e.target.checked)}
            />
          </label>

          {secondsLeft !== null && (
            <div className={`flex items-center gap-2 text-base font-mono font-semibold flex-shrink-0 ${secondsLeft < 120 ? 'text-error animate-pulse' : 'text-base-content/70'}`}>
              <Clock className="w-5 h-5" />
              {formatTime(secondsLeft)}
            </div>
          )}
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-base-content/40">Питання #{currentQuestion.number}</p>
          {isPaid && (
            <button
              onClick={() => toggleSaveQuestion(currentQuestion.id)}
              disabled={savingQuestion === currentQuestion.id}
              className={`btn btn-sm gap-1.5 transition-all ${
                savedQuestions.has(currentQuestion.id)
                  ? 'btn-primary btn-outline'
                  : 'btn-ghost'
              }`}
              title={savedQuestions.has(currentQuestion.id) ? 'Прибрати з збережених' : 'Зберегти питання'}
            >
              {savingQuestion === currentQuestion.id ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <Bookmark className={`w-4 h-4 ${savedQuestions.has(currentQuestion.id) ? 'fill-current' : ''}`} />
              )}
              {savedQuestions.has(currentQuestion.id) ? 'Збережено' : 'Зберегти'}
            </button>
          )}
        </div>
        <h2 className="text-lg font-medium leading-relaxed">{currentQuestion.text}</h2>
      </div>

      {/* Image */}
      {currentQuestion.image && (
        <div className="mb-6 rounded-xl overflow-hidden border border-base-300/60 bg-base-200">
          <img
            src={currentQuestion.image}
            alt="Ілюстрація до питання"
            className="w-full object-contain max-h-64"
          />
        </div>
      )}

      {/* Answers */}
      <div className="space-y-2 mb-8">
        {currentQuestion.answers.map((answer) => {
          const isSelected = currentAnswer?.selectedId === answer.id
          const hasAnswered = !!currentAnswer?.selectedId

          // Training mode styles
          const isCorrectAnswer = showResult && currentAnswer?.result?.correct_answer_id === answer.id
          const isWrongSelected = showResult && isSelected && !currentAnswer?.result?.is_correct

          let borderClass = 'border-base-300/60'
          let bgClass = 'bg-base-100'
          let indicatorClass = 'border-base-300'

          if (isExamMode) {
            // Exam: only highlight selected, no correct/wrong
            if (isSelected) {
              borderClass = 'border-primary/50'
              bgClass = 'bg-primary/5'
              indicatorClass = 'border-primary bg-primary text-white'
            } else if (!hasAnswered) {
              borderClass += ' hover:border-primary/40'
            }
          } else if (showResult) {
            // Training: show correct/wrong
            if (isCorrectAnswer) {
              borderClass = 'border-success/50'
              bgClass = 'bg-success/5'
              indicatorClass = 'border-success bg-success text-white'
            } else if (isWrongSelected) {
              borderClass = 'border-error/50'
              bgClass = 'bg-error/5'
              indicatorClass = 'border-error bg-error text-white'
            } else {
              borderClass = 'border-base-300/40'
            }
          } else if (!hasAnswered) {
            borderClass += ' hover:border-primary/40'
          }

          return (
            <button
              key={answer.id}
              onClick={() => handleAnswer(currentQuestion.id, answer.id)}
              disabled={hasAnswered}
              className={`w-full text-left p-4 rounded-xl border transition-all ${borderClass} ${bgClass} ${
                !hasAnswered ? 'cursor-pointer active:scale-[0.99]' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${indicatorClass}`}>
                  {isCorrectAnswer && <CheckCircle className="w-4 h-4" />}
                  {isWrongSelected && <XCircle className="w-4 h-4" />}
                </div>
                <span className={`text-sm leading-relaxed ${showResult && !isCorrectAnswer && !isWrongSelected ? 'text-base-content/40' : ''}`}>
                  {answer.text}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Explanation (training mode only) */}
      {showResult && currentAnswer?.result?.explanation && (
        <div className="mb-8 p-4 rounded-xl bg-info/5 border border-info/20 text-sm leading-relaxed">
          <p className="font-medium text-info mb-1">Пояснення</p>
          <p className="text-base-content/70">{currentAnswer.result.explanation}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3 pb-4">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="btn btn-ghost btn-sm gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Назад
        </button>

        <div className="flex gap-2">
          {isExamMode && (
            <button
              onClick={handleFinish}
              disabled={finishing}
              className="btn btn-outline btn-error btn-sm gap-1"
            >
              <Flag className="w-4 h-4" />
              Завершити
            </button>
          )}

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex(currentIndex + 1)}
              className="btn btn-primary btn-sm gap-1"
            >
              Далі
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={finishing}
              className="btn btn-primary btn-sm gap-1"
            >
              {finishing && <span className="loading loading-spinner loading-xs" />}
              <Flag className="w-4 h-4" />
              {isExamMode ? 'Здати роботу' : 'Завершити тест'}
            </button>
          )}
        </div>
      </div>

      {/* Bottom stats */}
      <div className="text-center text-xs text-base-content/40 pb-4">
        Відповідей: {answeredCount} / {questions.length}
        {isExamMode && answeredCount < questions.length && (
          <span className="text-warning ml-2">
            (без відповіді: {questions.length - answeredCount})
          </span>
        )}
      </div>

      {/* Confirm exit modal */}
      {showConfirmExit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="card bg-base-100 shadow-xl max-w-sm mx-4">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-2">
                <LogOut className="w-6 h-6 text-warning" />
                <h3 className="font-semibold text-lg">Вийти з тесту?</h3>
              </div>
              <p className="text-sm text-base-content/60 mb-4">
                {isExamMode
                  ? 'Якщо ви вийдете, тест буде завершено. Питання без відповіді зараховуються як неправильні.'
                  : 'Ваш прогрес буде втрачено. Ви зможете розпочати тест заново.'
                }
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowConfirmExit(false)}
                  className="btn btn-ghost btn-sm"
                >
                  Залишитися
                </button>
                <button
                  onClick={() => {
                    setShowConfirmExit(false)
                    if (isExamMode) {
                      doFinish()
                    } else {
                      sessionStorage.removeItem(`test_${attemptId}`)
                      router.push('/tests')
                    }
                  }}
                  className="btn btn-error btn-sm"
                >
                  Вийти
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm finish modal (exam mode) */}
      {showConfirmFinish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="card bg-base-100 shadow-xl max-w-sm mx-4">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="w-6 h-6 text-warning" />
                <h3 className="font-semibold text-lg">Завершити тест?</h3>
              </div>
              <p className="text-sm text-base-content/60 mb-4">
                Ви відповіли на {answeredCount} з {questions.length} питань.
                Питання без відповіді будуть зараховані як неправильні.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowConfirmFinish(false)}
                  className="btn btn-ghost btn-sm"
                >
                  Повернутися
                </button>
                <button
                  onClick={() => { setShowConfirmFinish(false); doFinish() }}
                  className="btn btn-primary btn-sm"
                >
                  Завершити
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
