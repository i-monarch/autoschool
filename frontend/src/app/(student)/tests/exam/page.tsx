'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

export default function ExamStartPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)

  const startTest = async () => {
    setLoading(true)
    try {
      const res = await api.post('/tests/start/', { test_type: 'exam' })
      sessionStorage.setItem(`test_${res.data.attempt_id}`, JSON.stringify(res.data))
      router.push(`/tests/session/${res.data.attempt_id}`)
    } catch {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!started) {
      setStarted(true)
      startTest()
    }
  }, [])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <span className="loading loading-spinner loading-lg text-error mb-4" />
        <p className="text-base-content/60">Готуємо екзамен...</p>
      </div>
    </div>
  )
}
