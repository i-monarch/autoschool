'use client'

import { useEffect, useState } from 'react'
import {
  BookOpen, SignpostBig, Route, CircleDot, UserCheck, Receipt,
  ChevronRight, GraduationCap, Lock,
} from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

const PAID_SECTIONS = new Set<string>()

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
  const user = useAuthStore(s => s.user)
  const isPaid = user?.is_paid ?? false
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
      {/* Header with traffic light decoration */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-500/90 via-blue-500 to-indigo-600 text-white mb-8">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          {/* Traffic light */}
          <svg className="absolute right-8 top-1/2 -translate-y-1/2 w-12 h-28 opacity-20" viewBox="0 0 36 84" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="2" width="28" height="64" rx="6" stroke="white" strokeWidth="2.5" fill="none" />
            <circle cx="18" cy="18" r="8" stroke="white" strokeWidth="2" fill="white" opacity="0.15" />
            <circle cx="18" cy="38" r="8" stroke="white" strokeWidth="2" fill="white" opacity="0.15" />
            <circle cx="18" cy="58" r="8" stroke="white" strokeWidth="2" fill="white" opacity="0.5" />
            <rect x="15" y="66" width="6" height="16" rx="1" fill="white" opacity="0.2" />
          </svg>
          {/* Open book */}
          <svg className="absolute right-28 bottom-3 w-16 h-14 opacity-10" viewBox="0 0 64 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M32 12 C24 8, 8 6, 4 10 L4 48 C8 44, 24 46, 32 50" stroke="white" strokeWidth="3" fill="none" />
            <path d="M32 12 C40 8, 56 6, 60 10 L60 48 C56 44, 40 46, 32 50" stroke="white" strokeWidth="3" fill="none" />
            <line x1="32" y1="12" x2="32" y2="50" stroke="white" strokeWidth="2" opacity="0.5" />
          </svg>
          {/* Decorative lines */}
          <div className="absolute left-0 top-0 w-full h-full">
            <div className="absolute top-4 left-[30%] w-16 h-0.5 bg-white/10 rounded-full" />
            <div className="absolute bottom-6 left-[15%] w-24 h-0.5 bg-white/10 rounded-full" />
            <div className="absolute top-8 left-[50%] w-12 h-0.5 bg-white/10 rounded-full" />
          </div>
        </div>

        <div className="relative px-6 py-7 sm:px-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Теорія ПДР</h1>
              <p className="text-white/60 text-sm">Вивчайте правила дорожнього руху</p>
            </div>
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
            const isLocked = PAID_SECTIONS.has(sec.slug) && !isPaid

            if (isLocked) {
              return (
                <div key={sec.id} className="card bg-base-100 border border-base-300/60 opacity-60">
                  <div className="card-body p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-base-200 text-base-content/30 flex items-center justify-center flex-shrink-0">
                        <Lock className="w-7 h-7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="font-bold text-lg mb-1">{sec.title}</h2>
                        <p className="text-sm text-base-content/50 mb-3">{sec.description}</p>
                        <span className="text-xs text-warning font-medium">Доступний після оплати</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }

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
