'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, ChevronRight, BookOpen } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'

interface Chapter {
  id: number
  title: string
  slug: string
  number: number
  order: number
}

interface Section {
  id: number
  title: string
  slug: string
  description: string
  chapters_count: number
}

export default function SectionPage() {
  const params = useParams()
  const sectionSlug = params.sectionSlug as string

  const [chapters, setChapters] = useState<Chapter[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/theory/sections/${sectionSlug}/chapters/`).then(r => r.data),
      api.get('/theory/sections/').then(r => r.data),
    ]).then(([ch, sec]) => {
      setChapters(ch)
      setSections(sec)
    }).catch(() => {})
      .finally(() => setLoading(false))
  }, [sectionSlug])

  const section = sections.find(s => s.slug === sectionSlug)

  if (loading) {
    return (
      <div>
        <div className="skeleton h-8 w-48 mb-6" />
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Back + title */}
      <div className="mb-6">
        <Link href="/theory" className="inline-flex items-center gap-1.5 text-sm text-base-content/50 hover:text-primary transition-colors mb-3">
          <ArrowLeft className="w-4 h-4" />
          Теорія ПДР
        </Link>
        <h1 className="text-2xl font-bold">{section?.title || 'Завантаження...'}</h1>
        {section?.description && (
          <p className="text-base-content/50 text-sm mt-1">{section.description}</p>
        )}
      </div>

      {/* Chapters list */}
      {chapters.length === 0 ? (
        <div className="card bg-base-100 border border-base-300/60">
          <div className="card-body items-center text-center py-12">
            <BookOpen className="w-12 h-12 text-base-content/20 mb-3" />
            <p className="text-base-content/50">Розділи ще не завантажено</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {chapters.map((ch, i) => (
            <Link
              key={ch.id}
              href={`/theory/${sectionSlug}/${ch.slug}`}
              className="flex items-center gap-4 p-4 rounded-xl bg-base-100 border border-base-300/60 hover:border-primary/30 hover:bg-primary/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                {ch.number || i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium group-hover:text-primary transition-colors">{ch.title}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-base-content/20 group-hover:text-primary/60 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
