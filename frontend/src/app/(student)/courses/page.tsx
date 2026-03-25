'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  BookOpen, Car, Scale, ShieldCheck, MapPin,
  Play, Clock, Lock, ChevronRight, Search, Video,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { MOCK_COURSES, formatDuration } from '@/data/mock-courses'
import type { VideoCourse } from '@/types/courses'

const ICON_MAP: Record<string, { icon: typeof BookOpen; bg: string; text: string }> = {
  BookOpen: { icon: BookOpen, bg: 'bg-blue-500/10', text: 'text-blue-600' },
  Car: { icon: Car, bg: 'bg-orange-500/10', text: 'text-orange-600' },
  Scale: { icon: Scale, bg: 'bg-violet-500/10', text: 'text-violet-600' },
  ShieldCheck: { icon: ShieldCheck, bg: 'bg-green-500/10', text: 'text-green-600' },
  MapPin: { icon: MapPin, bg: 'bg-red-500/10', text: 'text-red-600' },
}

function CourseCard({ course }: { course: VideoCourse }) {
  const { user } = useAuthStore()
  const iconConfig = ICON_MAP[course.icon] || ICON_MAP.BookOpen
  const IconComponent = iconConfig.icon
  const freeLessons = course.lessons?.filter(l => l.is_free).length || 0
  const totalDuration = course.lessons?.reduce((sum, l) => sum + l.duration_seconds, 0) || 0
  const totalMinutes = Math.round(totalDuration / 60)

  return (
    <Link href={`/courses/${course.slug}`} className="group">
      <div className="card bg-base-100 border border-base-300/60 hover:border-primary/30 hover:shadow-lg transition-all duration-200 h-full">
        {/* Thumbnail placeholder */}
        <div className={`h-40 ${iconConfig.bg} flex items-center justify-center relative overflow-hidden`}>
          <IconComponent className={`w-16 h-16 ${iconConfig.text} opacity-30`} />
          <div className="absolute inset-0 bg-gradient-to-t from-base-100/80 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <span className="badge badge-sm gap-1 bg-base-100/90 border-0">
              <Video className="w-3 h-3" />
              {course.lessons_count} уроків
            </span>
            <span className="badge badge-sm gap-1 bg-base-100/90 border-0">
              <Clock className="w-3 h-3" />
              {totalMinutes} хв
            </span>
          </div>
        </div>

        <div className="card-body p-4 gap-2">
          <h3 className="card-title text-base leading-tight group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-base-content/60 line-clamp-2">
            {course.description}
          </p>

          <div className="flex items-center justify-between mt-auto pt-2">
            <div className="flex items-center gap-1.5 text-xs text-base-content/50">
              <Play className="w-3.5 h-3.5 text-success" />
              <span>{freeLessons} безкоштовних</span>
            </div>
            {!user?.is_paid && (
              <div className="flex items-center gap-1 text-xs text-warning">
                <Lock className="w-3 h-3" />
                <span>Частково</span>
              </div>
            )}
            <ChevronRight className="w-4 h-4 text-base-content/30 group-hover:text-primary transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function CoursesPage() {
  const [search, setSearch] = useState('')
  const { user } = useAuthStore()

  const filtered = MOCK_COURSES.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  )

  const totalLessons = MOCK_COURSES.reduce((sum, c) => sum + c.lessons_count, 0)
  const freeLessonsTotal = MOCK_COURSES.reduce(
    (sum, c) => sum + (c.lessons?.filter(l => l.is_free).length || 0), 0
  )

  return (
    <div>
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white mb-8">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          {/* Film strip */}
          <svg className="absolute right-0 top-0 h-full w-28 opacity-[0.08]" viewBox="0 0 100 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="0" width="80" height="200" rx="4" stroke="white" strokeWidth="2" fill="none" />
            {/* Perforations left */}
            <rect x="14" y="8" width="10" height="7" rx="1.5" fill="white" />
            <rect x="14" y="28" width="10" height="7" rx="1.5" fill="white" />
            <rect x="14" y="48" width="10" height="7" rx="1.5" fill="white" />
            <rect x="14" y="68" width="10" height="7" rx="1.5" fill="white" />
            <rect x="14" y="88" width="10" height="7" rx="1.5" fill="white" />
            <rect x="14" y="108" width="10" height="7" rx="1.5" fill="white" />
            <rect x="14" y="128" width="10" height="7" rx="1.5" fill="white" />
            <rect x="14" y="148" width="10" height="7" rx="1.5" fill="white" />
            <rect x="14" y="168" width="10" height="7" rx="1.5" fill="white" />
            <rect x="14" y="188" width="10" height="7" rx="1.5" fill="white" />
            {/* Perforations right */}
            <rect x="76" y="8" width="10" height="7" rx="1.5" fill="white" />
            <rect x="76" y="28" width="10" height="7" rx="1.5" fill="white" />
            <rect x="76" y="48" width="10" height="7" rx="1.5" fill="white" />
            <rect x="76" y="68" width="10" height="7" rx="1.5" fill="white" />
            <rect x="76" y="88" width="10" height="7" rx="1.5" fill="white" />
            <rect x="76" y="108" width="10" height="7" rx="1.5" fill="white" />
            <rect x="76" y="128" width="10" height="7" rx="1.5" fill="white" />
            <rect x="76" y="148" width="10" height="7" rx="1.5" fill="white" />
            <rect x="76" y="168" width="10" height="7" rx="1.5" fill="white" />
            <rect x="76" y="188" width="10" height="7" rx="1.5" fill="white" />
          </svg>
          {/* Steering wheel */}
          <svg className="absolute right-32 top-1/2 -translate-y-1/2 w-24 h-24 opacity-[0.08]" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="34" stroke="white" strokeWidth="6" fill="none" />
            <circle cx="40" cy="40" r="8" stroke="white" strokeWidth="3" fill="none" />
            <line x1="40" y1="14" x2="40" y2="32" stroke="white" strokeWidth="4" strokeLinecap="round" />
            <line x1="17" y1="52" x2="33" y2="44" stroke="white" strokeWidth="4" strokeLinecap="round" />
            <line x1="63" y1="52" x2="47" y2="44" stroke="white" strokeWidth="4" strokeLinecap="round" />
          </svg>
          {/* Play button */}
          <svg className="absolute left-[45%] bottom-3 w-10 h-10 opacity-[0.1]" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" stroke="white" strokeWidth="2.5" fill="none" />
            <polygon points="16,12 30,20 16,28" fill="white" />
          </svg>
        </div>

        <div className="relative px-6 py-7 sm:px-8 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
                  <Video className="w-6 h-6" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold">Відеокурси</h1>
              </div>
              <p className="text-white/60 text-sm ml-14">
                {totalLessons} відеоуроків з теорії водіння
                {!user?.is_paid && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-white/15 text-white/80 text-xs">
                    {freeLessonsTotal} безкоштовних
                  </span>
                )}
              </p>
            </div>
            <div className="join flex-shrink-0 ml-14 sm:ml-0">
              <div className="join-item flex items-center pl-3 bg-white/10 border border-white/20 border-r-0 rounded-l-lg">
                <Search className="w-4 h-4 text-white/50" />
              </div>
              <input
                type="text"
                placeholder="Пошук курсу..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input join-item input-sm w-full sm:w-48 bg-white/10 border border-white/20 border-l-0 text-white placeholder:text-white/40 focus:outline-none focus:bg-white/15"
              />
            </div>
          </div>
          {!user?.is_paid && (
            <div className="flex items-center gap-2 mt-4 ml-14 text-sm text-white/70">
              <Play className="w-4 h-4 text-white/50" />
              <span>Перші 2 уроки у кожному курсі — безкоштовно.</span>
              <Link href="/payments" className="underline text-white hover:text-white/90 font-medium ml-1">
                Обрати тариф
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Course grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {filtered.length === 0 && search && (
        <div className="text-center py-12">
          <p className="text-base-content/50">Нічого не знайдено за запитом &quot;{search}&quot;</p>
        </div>
      )}
    </div>
  )
}
