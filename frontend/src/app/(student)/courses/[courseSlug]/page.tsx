'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  BookOpen, Car, Scale, ShieldCheck, MapPin,
  Play, Clock, Lock, ChevronLeft, CheckCircle2, Video,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { MOCK_COURSES, formatDuration } from '@/data/mock-courses'
import type { VideoLesson } from '@/types/courses'

const ICON_MAP: Record<string, { icon: typeof BookOpen; bg: string; text: string }> = {
  BookOpen: { icon: BookOpen, bg: 'bg-blue-500/10', text: 'text-blue-600' },
  Car: { icon: Car, bg: 'bg-orange-500/10', text: 'text-orange-600' },
  Scale: { icon: Scale, bg: 'bg-violet-500/10', text: 'text-violet-600' },
  ShieldCheck: { icon: ShieldCheck, bg: 'bg-green-500/10', text: 'text-green-600' },
  MapPin: { icon: MapPin, bg: 'bg-red-500/10', text: 'text-red-600' },
}

function LessonRow({
  lesson,
  courseSlug,
  isPaid,
  index,
}: {
  lesson: VideoLesson
  courseSlug: string
  isPaid: boolean
  index: number
}) {
  const canAccess = lesson.is_free || isPaid
  const completed = lesson.completed || false

  const content = (
    <div className={`
      flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-all
      ${canAccess
        ? 'border-base-300/60 hover:border-primary/30 hover:bg-base-200/30 cursor-pointer'
        : 'border-base-300/40 bg-base-200/20 opacity-70'
      }
    `}>
      {/* Number / Status */}
      <div className={`
        w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-semibold
        ${completed
          ? 'bg-success/10 text-success'
          : canAccess
            ? 'bg-primary/10 text-primary'
            : 'bg-base-300/50 text-base-content/30'
        }
      `}>
        {completed ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : canAccess ? (
          <Play className="w-4 h-4" />
        ) : (
          <Lock className="w-4 h-4" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-base-content/40 font-medium">
            {String(index + 1).padStart(2, '0')}
          </span>
          <h3 className={`font-medium text-sm sm:text-base truncate ${!canAccess ? 'text-base-content/50' : ''}`}>
            {lesson.title}
          </h3>
        </div>
        <p className="text-xs text-base-content/50 mt-0.5 line-clamp-1 hidden sm:block">
          {lesson.description}
        </p>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {lesson.is_free && (
          <span className="badge badge-sm badge-success badge-outline hidden sm:flex">
            Безкоштовно
          </span>
        )}
        <span className="text-xs text-base-content/40 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDuration(lesson.duration_seconds)}
        </span>
      </div>
    </div>
  )

  if (canAccess) {
    return (
      <Link href={`/courses/${courseSlug}/${lesson.slug}`}>
        {content}
      </Link>
    )
  }

  return content
}

export default function CourseDetailPage() {
  const params = useParams()
  const { user } = useAuthStore()
  const courseSlug = params.courseSlug as string

  const course = MOCK_COURSES.find(c => c.slug === courseSlug)

  if (!course) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-semibold mb-2">Курс не знайдено</h2>
        <Link href="/courses" className="btn btn-primary btn-sm btn-outline">
          Повернутись до курсів
        </Link>
      </div>
    )
  }

  const iconConfig = ICON_MAP[course.icon] || ICON_MAP.BookOpen
  const IconComponent = iconConfig.icon
  const isPaid = user?.is_paid || false
  const lessons = course.lessons || []
  const freeLessons = lessons.filter(l => l.is_free).length
  const totalDuration = lessons.reduce((sum, l) => sum + l.duration_seconds, 0)
  const totalMinutes = Math.round(totalDuration / 60)

  return (
    <div>
      {/* Back link */}
      <Link href="/courses" className="inline-flex items-center gap-1.5 text-sm text-base-content/60 hover:text-primary mb-4 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        Всі курси
      </Link>

      {/* Course header */}
      <div className="card bg-base-100 border border-base-300/60 mb-6">
        <div className="card-body p-4 sm:p-6">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl ${iconConfig.bg} flex items-center justify-center flex-shrink-0`}>
              <IconComponent className={`w-7 h-7 ${iconConfig.text}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold leading-tight">{course.title}</h1>
              <p className="text-sm text-base-content/60 mt-1">{course.description}</p>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-base-content/50">
                <span className="flex items-center gap-1">
                  <Video className="w-4 h-4" />
                  {lessons.length} уроків
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {totalMinutes} хвилин
                </span>
                <span className="flex items-center gap-1">
                  <Play className="w-4 h-4 text-success" />
                  {freeLessons} безкоштовних
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Paywall info */}
      {!isPaid && (
        <div className="alert bg-warning/5 border border-warning/20 mb-4">
          <Lock className="w-4 h-4 text-warning flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm">
              Доступні перші {freeLessons} уроки. Для повного доступу оберіть тариф.
            </p>
          </div>
          <Link href="/payments" className="btn btn-warning btn-sm btn-outline flex-shrink-0">
            Тарифи
          </Link>
        </div>
      )}

      {/* Lessons list */}
      <div className="space-y-2">
        {lessons.map((lesson, index) => (
          <LessonRow
            key={lesson.id}
            lesson={lesson}
            courseSlug={courseSlug}
            isPaid={isPaid}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}
