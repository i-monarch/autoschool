'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft, ChevronRight, Play, Lock, Clock, Video,
  List, CheckCircle2,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { MOCK_COURSES, formatDuration } from '@/data/mock-courses'

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()

  const courseSlug = params.courseSlug as string
  const lessonSlug = params.lessonSlug as string

  const course = MOCK_COURSES.find(c => c.slug === courseSlug)
  const lessons = course?.lessons || []
  const lessonIndex = lessons.findIndex(l => l.slug === lessonSlug)
  const lesson = lessonIndex >= 0 ? lessons[lessonIndex] : null

  if (!course || !lesson) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-semibold mb-2">Урок не знайдено</h2>
        <Link href="/courses" className="btn btn-primary btn-sm btn-outline">
          Повернутись до курсів
        </Link>
      </div>
    )
  }

  const isPaid = user?.is_paid || false
  const canAccess = lesson.is_free || isPaid
  const prevLesson = lessonIndex > 0 ? lessons[lessonIndex - 1] : null
  const nextLesson = lessonIndex < lessons.length - 1 ? lessons[lessonIndex + 1] : null
  const nextCanAccess = nextLesson ? (nextLesson.is_free || isPaid) : false

  if (!canAccess) {
    return (
      <div>
        <Link href={`/courses/${courseSlug}`} className="inline-flex items-center gap-1.5 text-sm text-base-content/60 hover:text-primary mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          {course.title}
        </Link>

        <div className="card bg-base-100 border border-base-300/60">
          <div className="card-body items-center text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-warning/10 flex items-center justify-center mb-4">
              <Lock className="w-9 h-9 text-warning/60" />
            </div>
            <h2 className="text-xl font-bold mb-1">{lesson.title}</h2>
            <p className="text-base-content/60 max-w-md mb-4">{lesson.description}</p>
            <p className="text-sm text-base-content/50 mb-4">
              Цей урок доступний лише для оплачених акаунтів
            </p>
            <Link href="/payments" className="btn btn-primary btn-sm">
              Обрати тариф
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Back link */}
      <Link href={`/courses/${courseSlug}`} className="inline-flex items-center gap-1.5 text-sm text-base-content/60 hover:text-primary mb-4 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        {course.title}
      </Link>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1">
          {/* Video player placeholder */}
          <div className="relative aspect-video bg-neutral rounded-xl overflow-hidden mb-4">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-content">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4 hover:bg-primary/30 transition-colors cursor-pointer">
                <Play className="w-10 h-10 text-primary ml-1" />
              </div>
              <p className="text-sm text-neutral-content/60">Відео буде доступне після завантаження контенту</p>
            </div>
            {/* Duration badge */}
            <div className="absolute bottom-3 right-3">
              <span className="badge badge-sm bg-black/60 text-white border-0 gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(lesson.duration_seconds)}
              </span>
            </div>
          </div>

          {/* Lesson info */}
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm text-base-content/50 mb-1">
              <span>Урок {lessonIndex + 1} з {lessons.length}</span>
              {lesson.is_free && (
                <span className="badge badge-sm badge-success badge-outline">Безкоштовно</span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold">{lesson.title}</h1>
            <p className="text-base-content/60 mt-1">{lesson.description}</p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-base-300/60">
            {prevLesson ? (
              <button
                onClick={() => router.push(`/courses/${courseSlug}/${prevLesson.slug}`)}
                className="btn btn-ghost btn-sm gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Попередній</span>
              </button>
            ) : <div />}

            {nextLesson ? (
              nextCanAccess ? (
                <button
                  onClick={() => router.push(`/courses/${courseSlug}/${nextLesson.slug}`)}
                  className="btn btn-primary btn-sm gap-1.5"
                >
                  <span className="hidden sm:inline">Наступний</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex items-center gap-2 text-sm text-base-content/40">
                  <Lock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Наступний урок платний</span>
                </div>
              )
            ) : (
              <Link href={`/courses/${courseSlug}`} className="btn btn-success btn-sm gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Завершити курс
              </Link>
            )}
          </div>
        </div>

        {/* Sidebar — lessons list (desktop) */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <div className="card bg-base-100 border border-base-300/60 sticky top-20">
            <div className="card-body p-3">
              <h3 className="font-semibold text-sm flex items-center gap-2 px-2 pb-2 border-b border-base-300/40">
                <List className="w-4 h-4" />
                Уроки курсу
              </h3>
              <div className="space-y-0.5 max-h-[calc(100vh-12rem)] overflow-y-auto mt-2">
                {lessons.map((l, i) => {
                  const active = l.slug === lessonSlug
                  const accessible = l.is_free || isPaid
                  return (
                    <div key={l.id}>
                      {accessible ? (
                        <Link
                          href={`/courses/${courseSlug}/${l.slug}`}
                          className={`
                            flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors
                            ${active
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'hover:bg-base-200 text-base-content/70'
                            }
                          `}
                        >
                          <span className="w-6 text-center text-xs text-base-content/40">
                            {active ? <Play className="w-3.5 h-3.5 mx-auto text-primary" /> : i + 1}
                          </span>
                          <span className="flex-1 truncate">{l.title}</span>
                          <span className="text-xs text-base-content/30">{formatDuration(l.duration_seconds)}</span>
                        </Link>
                      ) : (
                        <div className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-base-content/30">
                          <span className="w-6 text-center">
                            <Lock className="w-3 h-3 mx-auto" />
                          </span>
                          <span className="flex-1 truncate">{l.title}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
