'use client'

import { useEffect, useState } from 'react'
import { ClipboardCheck, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'

interface Attempt {
  id: number
  test_type: string
  category_name: string | null
  score: number
  total: number
  is_passed: boolean
  percent: number
  finished_at: string
}

const typeLabels: Record<string, string> = {
  topic: 'За темою',
  exam: 'Екзамен',
  marathon: 'Марафон',
}

export default function HistoryPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/tests/attempts/')
      .then(res => { setAttempts(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Мої результати</h1>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Мої результати</h1>
        <p className="text-base-content/60 text-sm mt-1">Історія пройдених тестів</p>
      </div>

      {attempts.length === 0 ? (
        <div className="card bg-base-100 border border-base-300/60">
          <div className="card-body items-center text-center py-12">
            <ClipboardCheck className="w-12 h-12 text-base-content/20 mb-3" />
            <p className="text-base-content/50">Ви ще не проходили тести</p>
            <Link href="/tests" className="btn btn-primary btn-sm mt-3">Пройти тест</Link>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {attempts.map(a => (
            <Link
              key={a.id}
              href={`/tests/result/${a.id}`}
              className="flex items-center gap-4 p-4 rounded-xl bg-base-100 border border-base-300/60 hover:border-primary/30 transition-colors"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                a.is_passed ? 'bg-success/10' : 'bg-error/10'
              }`}>
                {a.is_passed
                  ? <CheckCircle className="w-5 h-5 text-success" />
                  : <XCircle className="w-5 h-5 text-error" />
                }
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {a.category_name || typeLabels[a.test_type] || a.test_type}
                </p>
                <p className="text-xs text-base-content/50">
                  {typeLabels[a.test_type]} &middot; {new Date(a.finished_at).toLocaleDateString('uk-UA')}
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                <p className={`text-lg font-bold ${a.is_passed ? 'text-success' : 'text-error'}`}>
                  {a.percent}%
                </p>
                <p className="text-xs text-base-content/40">{a.score}/{a.total}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
