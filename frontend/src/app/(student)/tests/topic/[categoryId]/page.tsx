'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Play } from 'lucide-react'
import api from '@/lib/api'

export default function TopicTestPage() {
  const params = useParams()
  const router = useRouter()
  const categoryId = params.categoryId as string
  const [loading, setLoading] = useState(false)

  const startTest = async () => {
    setLoading(true)
    try {
      const res = await api.post('/tests/start/', {
        test_type: 'topic',
        category_id: parseInt(categoryId),
      })
      sessionStorage.setItem(`test_${res.data.attempt_id}`, JSON.stringify(res.data))
      router.push(`/tests/session/${res.data.attempt_id}`)
    } catch {
      setLoading(false)
    }
  }

  // Auto-start
  if (!loading) {
    startTest()
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <span className="loading loading-spinner loading-lg text-primary mb-4" />
        <p className="text-base-content/60">Завантажуємо питання...</p>
      </div>
    </div>
  )
}
