'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  BookOpen, Car, Scale, ShieldCheck, MapPin,
  Play, Clock, Lock, ChevronRight, Search, Video,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { PageHero } from '@/components/ui/PageHero'
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
      <PageHero
        title="Відеокурси"
        subtitle={`${totalLessons} відеоуроків${!user?.is_paid ? ` / ${freeLessonsTotal} безкоштовних` : ''}`}
        icon={<Video className="w-7 h-7" />}
        accentColor="secondary"
      >
        <div className="join flex-shrink-0">
          <div className="join-item flex items-center pl-3 bg-base-100/80 border border-base-300/60 border-r-0 rounded-l-lg">
            <Search className="w-4 h-4 text-base-content/40" />
          </div>
          <input
            type="text"
            placeholder="Пошук курсу..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input input-bordered join-item input-sm w-full sm:w-48 border-l-0 focus:outline-none"
          />
        </div>
      </PageHero>

      {/* Info banner for free users */}
      {!user?.is_paid && (
        <div className="alert bg-primary/5 border border-primary/20 mb-6">
          <Play className="w-5 h-5 text-primary flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm">
              <span className="font-medium">Перші 2 уроки у кожному курсі — безкоштовно.</span>
              {' '}Для доступу до всіх відеоуроків оберіть тариф.
            </p>
          </div>
          <Link href="/payments" className="btn btn-primary btn-sm btn-outline flex-shrink-0">
            Тарифи
          </Link>
        </div>
      )}

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
