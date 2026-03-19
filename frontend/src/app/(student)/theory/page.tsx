'use client'

import { useEffect, useState } from 'react'
import {
  BookOpen, SignpostBig, Route, CircleDot, UserCheck, Receipt,
  ChevronRight, GraduationCap,
} from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'

interface Section {
  id: number
  title: string
  slug: string
  description: string
  icon: string
  chapters_count: number
}

const iconMap: Record<string, React.ElementType> = {
  BookOpen, SignpostBig, Route, CircleDot, UserCheck, Receipt,
}

const colorMap: Record<string, string> = {
  BookOpen: 'bg-blue-500/10 text-blue-600',
  SignpostBig: 'bg-red-500/10 text-red-600',
  Route: 'bg-violet-500/10 text-violet-600',
  CircleDot: 'bg-emerald-500/10 text-emerald-600',
  UserCheck: 'bg-sky-500/10 text-sky-600',
  Receipt: 'bg-amber-500/10 text-amber-600',
}

const borderColorMap: Record<string, string> = {
  BookOpen: 'hover:border-blue-400/40',
  SignpostBig: 'hover:border-red-400/40',
  Route: 'hover:border-violet-400/40',
  CircleDot: 'hover:border-emerald-400/40',
  UserCheck: 'hover:border-sky-400/40',
  Receipt: 'hover:border-amber-400/40',
}

export default function TheoryPage() {
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/theory/sections/')
      .then(res => setSections(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Теорія ПДР</h1>
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-36 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Теорія ПДР</h1>
            <p className="text-base-content/50 text-sm">Вивчайте правила дорожнього руху</p>
          </div>
        </div>
      </div>

      {/* Section cards */}
      {sections.length === 0 ? (
        <div className="card bg-base-100 border border-base-300/60">
          <div className="card-body items-center text-center py-12">
            <GraduationCap className="w-12 h-12 text-base-content/20 mb-3" />
            <p className="text-base-content/50">Матеріали ще не завантажено</p>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {sections.map(sec => {
            const IconComponent = iconMap[sec.icon] || BookOpen
            const color = colorMap[sec.icon] || 'bg-primary/10 text-primary'
            const borderColor = borderColorMap[sec.icon] || 'hover:border-primary/40'
            return (
              <Link
                key={sec.id}
                href={`/theory/${sec.slug}`}
                className={`card bg-base-100 border border-base-300/60 ${borderColor} hover:shadow-lg transition-all group`}
              >
                <div className="card-body p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center flex-shrink-0`}>
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                        {sec.title}
                      </h2>
                      <p className="text-sm text-base-content/50 mb-3">{sec.description}</p>
                      <div className="flex items-center text-xs text-primary font-medium">
                        {sec.chapters_count > 0 && (
                          <span>{sec.chapters_count} {sec.chapters_count === 1 ? 'розділ' : sec.chapters_count < 5 ? 'розділи' : 'розділів'}</span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
