'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Trophy, Medal } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'

interface LeaderEntry {
  position: number
  user_id: number
  first_name: string
  total_correct: number
  total_answers: number
  accuracy_percent: number
}

interface LeaderboardData {
  current_user_id: number
  results: LeaderEntry[]
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/tests/leaderboard/')
      .then(res => { setData(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Рейтинг</h1>
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      </div>
    )
  }

  if (!data || data.results.length === 0) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Link href="/tests" className="btn btn-ghost btn-sm">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl font-bold">Рейтинг</h1>
        </div>
        <div className="card bg-base-100 border border-base-300/60">
          <div className="card-body items-center text-center py-12">
            <Trophy className="w-12 h-12 text-base-content/20 mb-3" />
            <p className="text-base-content/50">Ще ніхто не проходив тести</p>
          </div>
        </div>
      </div>
    )
  }

  const positionStyle = (pos: number) => {
    if (pos === 1) return 'text-warning'
    if (pos === 2) return 'text-base-content/60'
    if (pos === 3) return 'text-amber-700'
    return 'text-base-content/40'
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/tests" className="btn btn-ghost btn-sm">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Рейтинг</h1>
          <p className="text-base-content/60 text-sm mt-0.5">Топ-50 за правильними відповідями</p>
        </div>
      </div>

      <div className="card bg-base-100 border border-base-300/60 overflow-hidden">
        <table className="table table-sm">
          <thead>
            <tr>
              <th className="w-12">#</th>
              <th>Учень</th>
              <th className="text-right">Правильних</th>
              <th className="text-right">Всього</th>
              <th className="text-right">Точність</th>
            </tr>
          </thead>
          <tbody>
            {data.results.map(entry => {
              const isCurrentUser = entry.user_id === data.current_user_id
              return (
                <tr
                  key={entry.user_id}
                  className={isCurrentUser ? 'bg-primary/10 font-medium' : ''}
                >
                  <td>
                    <span className={`font-bold ${positionStyle(entry.position)}`}>
                      {entry.position <= 3 ? (
                        <Medal className={`w-5 h-5 inline ${positionStyle(entry.position)}`} />
                      ) : (
                        entry.position
                      )}
                    </span>
                  </td>
                  <td>
                    {entry.first_name}
                    {isCurrentUser && (
                      <span className="text-xs text-primary/70 ml-1.5">(ви)</span>
                    )}
                  </td>
                  <td className="text-right text-success">{entry.total_correct}</td>
                  <td className="text-right text-base-content/50">{entry.total_answers}</td>
                  <td className="text-right">
                    <span className={`font-semibold ${
                      entry.accuracy_percent >= 80 ? 'text-success' : entry.accuracy_percent >= 60 ? 'text-warning' : 'text-error'
                    }`}>
                      {entry.accuracy_percent}%
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
