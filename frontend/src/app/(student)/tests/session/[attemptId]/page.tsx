'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle, Flag } from 'lucide-react'
import api from '@/lib/api'

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
  const [timeLimit, setTimeLimit] = useState<number | null>(null)
  const [testType, setTestType] = useState('')
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  // Track answers per question
  const [answered, setAnswered] = useState<Record<number, {
    selectedId: number | null
    result: AnswerResult | null
  }>>({})

  const [finishing, setFinishing] = useState(false)

  // Load test data from sessionStorage (set by start pages)
  useEffect(() => {
    const stored = sessionStorage.getItem(`test_${attemptId}`)
    if (!stored) {
      router.push('/tests')
      return
    }
    const data = JSON.parse(stored)
    setQuestions(data.questions)
    setTimeLimit(data.time_limit_minutes)
    setTestType(data.test_type)
    if (data.time_limit_minutes) {
      setSecondsLeft(data.time_limit_minutes * 60)
    }
    setLoading(false)
  }, [attemptId, router])

  // Timer
  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0) return
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer)
          handleFinish()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [secondsLeft !== null])

  const handleAnswer = async (questionId: number, answerId: number) => {
    if (answered[questionId]?.result) return // already answered

    try {
      const res = await api.post(`/tests/attempts/${attemptId}/answer/`, {
        question_id: questionId,
        answer_id: answerId,
      })

      setAnswered(prev => ({
        ...prev,
        [questionId]: { selectedId: answerId, result: res.data },
      }))
    } catch {
      // handle error
    }
  }

  const handleFinish = async () => {
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

  const currentQuestion = questions[currentIndex]
  const answeredCount = Object.keys(answered).length
  const correctCount = Object.values(answered).filter(a => a.result?.is_correct).length

  if (loading || !currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  const currentAnswer = answered[currentQuestion.id]
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header bar */}
      <div className="sticky top-16 z-20 bg-base-200/80 backdrop-blur-md -mx-4 px-4 py-3 mb-4 border-b border-base-300/40">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm">
            <span className="font-semibold">{currentIndex + 1}</span>
            <span className="text-base-content/40"> / {questions.length}</span>
          </div>

          {/* Question nav dots */}
          <div className="flex-1 flex gap-1 overflow-x-auto py-1 scrollbar-none">
            {questions.map((q, i) => {
              const a = answered[q.id]
              let bg = 'bg-base-300'
              if (a?.result?.is_correct) bg = 'bg-success'
              else if (a?.result && !a.result.is_correct) bg = 'bg-error'
              else if (i === currentIndex) bg = 'bg-primary'

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-colors ${bg}`}
                />
              )
            })}
          </div>

          {secondsLeft !== null && (
            <div className={`flex items-center gap-1.5 text-sm font-mono ${secondsLeft < 120 ? 'text-error' : 'text-base-content/60'}`}>
              <Clock className="w-4 h-4" />
              {formatTime(secondsLeft)}
            </div>
          )}
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <p className="text-xs text-base-content/40 mb-2">Питання #{currentQuestion.number}</p>
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
          const isCorrect = currentAnswer?.result?.correct_answer_id === answer.id
          const isWrong = isSelected && !currentAnswer?.result?.is_correct
          const isAnswered = !!currentAnswer?.result

          let borderClass = 'border-base-300/60 hover:border-primary/40'
          let bgClass = 'bg-base-100'
          if (isAnswered) {
            if (isCorrect) {
              borderClass = 'border-success/50'
              bgClass = 'bg-success/5'
            } else if (isWrong) {
              borderClass = 'border-error/50'
              bgClass = 'bg-error/5'
            } else {
              borderClass = 'border-base-300/40'
            }
          }

          return (
            <button
              key={answer.id}
              onClick={() => handleAnswer(currentQuestion.id, answer.id)}
              disabled={isAnswered}
              className={`w-full text-left p-4 rounded-xl border transition-all ${borderClass} ${bgClass} ${
                !isAnswered ? 'cursor-pointer active:scale-[0.99]' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isCorrect ? 'border-success bg-success text-white' :
                  isWrong ? 'border-error bg-error text-white' :
                  isSelected ? 'border-primary bg-primary text-white' :
                  'border-base-300'
                }`}>
                  {isCorrect && <CheckCircle className="w-4 h-4" />}
                  {isWrong && <XCircle className="w-4 h-4" />}
                </div>
                <span className={`text-sm leading-relaxed ${isAnswered && !isCorrect && !isWrong ? 'text-base-content/40' : ''}`}>
                  {answer.text}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {currentAnswer?.result?.explanation && (
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
            Завершити тест
          </button>
        )}
      </div>

      {/* Bottom stats */}
      <div className="text-center text-xs text-base-content/40 pb-4">
        Відповідей: {answeredCount} / {questions.length}
      </div>
    </div>
  )
}
