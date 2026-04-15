'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle, XCircle, RotateCcw, ArrowLeft, Trophy, Bookmark, Send } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'

interface QuestionCommentData {
  id: number
  user_name: string
  text: string
  created_at: string
}

interface AttemptResult {
  id: number
  test_type: string
  category_name: string | null
  score: number
  total: number
  is_passed: boolean
  percent: number
  started_at: string
  finished_at: string
  answers: Array<{
    question: {
      id: number
      number: number
      text: string
      image: string | null
      explanation: string | null
      answers: Array<{ id: number; text: string; is_correct: boolean }>
    }
    selected_answer_id: number | null
    is_correct: boolean
  }>
}

export default function TestResultPage() {
  const params = useParams()
  const router = useRouter()
  const attemptId = params.attemptId as string

  const [result, setResult] = useState<AttemptResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)
  const [savedQuestions, setSavedQuestions] = useState<Set<number>>(new Set())
  const [comments, setComments] = useState<Record<number, QuestionCommentData[]>>({})
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({})
  const [submittingComment, setSubmittingComment] = useState<number | null>(null)

  useEffect(() => {
    api.get(`/tests/attempts/${attemptId}/`)
      .then(res => { setResult(res.data); setLoading(false) })
      .catch(() => { router.push('/tests'); })

    api.get('/tests/saved/list/').then(res => {
      const ids = new Set<number>(res.data.results.map((s: { question: { id: number } }) => s.question.id))
      setSavedQuestions(ids)
    }).catch(() => {})
  }, [attemptId, router])

  const toggleSaveQuestion = async (questionId: number) => {
    try {
      const res = await api.post('/tests/saved/', { question_id: questionId })
      setSavedQuestions(prev => {
        const next = new Set(prev)
        if (res.data.saved) next.add(questionId)
        else next.delete(questionId)
        return next
      })
    } catch {}
  }

  const loadComments = async (questionId: number) => {
    if (comments[questionId]) return
    try {
      const res = await api.get(`/tests/questions/${questionId}/comments/`)
      setComments(prev => ({ ...prev, [questionId]: res.data }))
    } catch {}
  }

  const submitComment = async (questionId: number) => {
    const text = commentInputs[questionId]?.trim()
    if (!text) return
    setSubmittingComment(questionId)
    try {
      const res = await api.post(`/tests/questions/${questionId}/comments/`, { text })
      setComments(prev => ({
        ...prev,
        [questionId]: [res.data, ...(prev[questionId] || [])],
      }))
      setCommentInputs(prev => ({ ...prev, [questionId]: '' }))
    } catch {}
    setSubmittingComment(null)
  }

  if (loading || !result) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  const passed = result.is_passed

  return (
    <div>
      {/* Result card */}
      <div className={`card border ${passed ? 'border-success/30 bg-success/5' : 'border-error/30 bg-error/5'} mb-6`}>
        <div className="card-body items-center text-center py-10">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
            passed ? 'bg-success/20' : 'bg-error/20'
          }`}>
            {passed
              ? <Trophy className="w-10 h-10 text-success" />
              : <XCircle className="w-10 h-10 text-error" />
            }
          </div>

          <h1 className="text-2xl font-bold mb-1">
            {passed ? 'Тест складено!' : 'Тест не складено'}
          </h1>

          <p className="text-base-content/60 mb-4">
            {result.category_name || (result.test_type === 'exam' ? 'Екзамен' : 'Марафон')}
          </p>

          <div className="text-5xl font-bold mb-2">
            <span className={passed ? 'text-success' : 'text-error'}>{result.score}</span>
            <span className="text-base-content/30 text-3xl"> / {result.total}</span>
          </div>

          <p className="text-sm text-base-content/50">
            {result.percent}% правильних відповідей (потрібно 80%)
          </p>

          {/* Progress bar */}
          <div className="w-full max-w-xs mt-4">
            <div className="w-full bg-base-300/50 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${passed ? 'bg-success' : 'bg-error'}`}
                style={{ width: `${result.percent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-8">
        <Link href="/tests" className="btn btn-ghost btn-sm flex-1 gap-2">
          <ArrowLeft className="w-4 h-4" />
          До тестів
        </Link>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="btn btn-outline btn-sm flex-1"
        >
          {showDetails ? 'Сховати деталі' : 'Показати деталі'}
        </button>
        <Link href={result.test_type === 'exam' ? '/tests/exam' : '/tests'} className="btn btn-primary btn-sm flex-1 gap-2">
          <RotateCcw className="w-4 h-4" />
          Ще раз
        </Link>
      </div>

      {/* Details */}
      {showDetails && result.answers && (
        <div className="space-y-4 pb-8">
          <h2 className="font-semibold">Деталі відповідей</h2>
          {result.answers.map((a, i) => (
            <div key={i} className={`card border p-4 ${a.is_correct ? 'border-success/20' : 'border-error/20'}`}>
              <div className="flex items-start gap-2 mb-3">
                {a.is_correct
                  ? <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  : <XCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                }
                <p className="text-sm font-medium flex-1">{a.question.text}</p>
                <button
                  onClick={() => toggleSaveQuestion(a.question.id)}
                  className="btn btn-ghost btn-xs"
                  title={savedQuestions.has(a.question.id) ? 'Прибрати з збережених' : 'Зберегти питання'}
                >
                  <Bookmark className={`w-4 h-4 ${savedQuestions.has(a.question.id) ? 'fill-primary text-primary' : ''}`} />
                </button>
              </div>

              {a.question.image && (
                <img src={a.question.image} alt="" className="rounded-lg mb-3 max-h-40 object-contain" />
              )}

              <div className="space-y-1 ml-7">
                {a.question.answers.map(ans => {
                  const isSelected = ans.id === a.selected_answer_id
                  const isCorrect = ans.is_correct
                  let cls = 'text-sm py-1'
                  if (isCorrect) cls += ' text-success font-medium'
                  else if (isSelected) cls += ' text-error line-through'
                  else cls += ' text-base-content/50'

                  return (
                    <p key={ans.id} className={cls}>
                      {isCorrect && '+ '}{isSelected && !isCorrect && '- '}{ans.text}
                    </p>
                  )
                })}
              </div>

              {a.question.explanation && (
                <p className="text-xs text-base-content/50 mt-2 ml-7 leading-relaxed">
                  {a.question.explanation}
                </p>
              )}

              {/* Comments section */}
              <div className="mt-3 ml-7 border-t border-base-300/40 pt-3">
                <button
                  onClick={() => loadComments(a.question.id)}
                  className="text-xs text-primary hover:underline"
                >
                  {comments[a.question.id] ? `Коментарі (${comments[a.question.id].length})` : 'Показати коментарі'}
                </button>

                {comments[a.question.id] && (
                  <div className="mt-2 space-y-2">
                    {/* Add comment */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="input input-bordered input-xs flex-1"
                        placeholder="Написати коментар..."
                        value={commentInputs[a.question.id] || ''}
                        onChange={e => setCommentInputs(prev => ({ ...prev, [a.question.id]: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter') submitComment(a.question.id) }}
                      />
                      <button
                        onClick={() => submitComment(a.question.id)}
                        disabled={submittingComment === a.question.id || !commentInputs[a.question.id]?.trim()}
                        className="btn btn-primary btn-xs"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Comment list */}
                    {comments[a.question.id].length === 0 && (
                      <p className="text-xs text-base-content/40">Коментарів ще немає</p>
                    )}
                    {comments[a.question.id].map(c => (
                      <div key={c.id} className="bg-base-200/50 rounded-lg p-2">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-medium">{c.user_name}</span>
                          <span className="text-xs text-base-content/30">
                            {new Date(c.created_at).toLocaleDateString('uk-UA')}
                          </span>
                        </div>
                        <p className="text-xs text-base-content/70">{c.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
