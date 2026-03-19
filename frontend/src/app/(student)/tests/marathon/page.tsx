'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

export default function MarathonStartPage() {
  const router = useRouter()
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (started) return
    setStarted(true)

    api.post('/tests/start/', { test_type: 'marathon' })
      .then(res => {
        sessionStorage.setItem(`test_${res.data.attempt_id}`, JSON.stringify(res.data))
        router.push(`/tests/session/${res.data.attempt_id}`)
      })
      .catch(() => router.push('/tests'))
  }, [])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <span className="loading loading-spinner loading-lg text-accent mb-4" />
        <p className="text-base-content/60">Готуємо марафон...</p>
      </div>
    </div>
  )
}
