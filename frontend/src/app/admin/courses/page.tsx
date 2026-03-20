'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Plus, Pencil, Trash2, Video,
  BookOpen, Eye, EyeOff, ArrowLeft, Clock, GripVertical,
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import api from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import CourseModal from './CourseModal'
import LessonModal from './LessonModal'

interface AdminCourse {
  id: number
  title: string
  slug: string
  description: string
  icon: string
  thumbnail: string
  order: number
  is_active: boolean
  lessons_count: number
}

interface AdminLesson {
  id: number
  title: string
  slug: string
  description: string
  order: number
  duration_seconds: number
  thumbnail: string
  video_url: string
  is_free: boolean
  is_active: boolean
  course: number
  course_title: string
}

interface CoursesStats {
  total_courses: number
  total_lessons: number
  courses: { id: number; title: string; lessons_count: number; is_active: boolean }[]
}

function formatDuration(seconds: number): string {
  if (!seconds) return '-'
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return sec > 0 ? `${min}:${sec.toString().padStart(2, '0')}` : `${min} хв`
}

// --- Sortable Course Item ---
function SortableCourseItem({
  course,
  isSelected,
  onSelect,
  onToggleActive,
  onEdit,
  onDelete,
}: {
  course: AdminCourse
  isSelected: boolean
  onSelect: () => void
  onToggleActive: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: course.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.5 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-1.5 px-2 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${
        isSelected
          ? 'bg-primary/10 text-primary font-medium'
          : 'hover:bg-base-200'
      } ${!course.is_active ? 'opacity-50' : ''}`}
      onClick={onSelect}
    >
      <button
        className="cursor-grab active:cursor-grabbing touch-none text-base-content/30 hover:text-base-content/60 flex-shrink-0"
        {...attributes}
        {...listeners}
        onClick={e => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <BookOpen className="w-4 h-4 flex-shrink-0 opacity-50" />
      <div className="flex-1 min-w-0">
        <span className="truncate block">{course.title}</span>
        <span className="text-xs opacity-50">
          {course.lessons_count} уроків
          {!course.is_active && ' (прихований)'}
        </span>
      </div>
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="btn btn-ghost btn-xs btn-square"
          onClick={e => { e.stopPropagation(); onToggleActive() }}
          title={course.is_active ? 'Приховати' : 'Активувати'}
        >
          {course.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
        </button>
        <button
          className="btn btn-ghost btn-xs btn-square"
          onClick={e => { e.stopPropagation(); onEdit() }}
          title="Редагувати"
        >
          <Pencil className="w-3 h-3" />
        </button>
        <button
          className="btn btn-ghost btn-xs btn-square text-error"
          onClick={e => { e.stopPropagation(); onDelete() }}
          title="Видалити"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

// --- Sortable Lesson Row ---
function SortableLessonRow({
  lesson,
  index,
  onEdit,
  onDelete,
  onToggleFree,
  onToggleActive,
}: {
  lesson: AdminLesson
  index: number
  onEdit: () => void
  onDelete: () => void
  onToggleFree: () => void
  onToggleActive: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.5 : undefined,
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover ${!lesson.is_active ? 'opacity-40' : ''} ${isDragging ? 'bg-base-200' : ''}`}
    >
      <td className="w-8">
        <button
          className="cursor-grab active:cursor-grabbing touch-none text-base-content/30 hover:text-base-content/60"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </td>
      <td className="font-mono text-xs w-10">{index + 1}</td>
      <td>
        <div>
          <span className="font-medium">{lesson.title}</span>
          {lesson.description && (
            <p className="text-xs text-base-content/50 line-clamp-1">{lesson.description}</p>
          )}
        </div>
      </td>
      <td className="text-xs text-base-content/60">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDuration(lesson.duration_seconds)}
        </span>
      </td>
      <td className="text-center">
        <input
          type="checkbox"
          className="toggle toggle-success toggle-xs"
          checked={lesson.is_free}
          onChange={onToggleFree}
        />
      </td>
      <td className="text-center">
        <input
          type="checkbox"
          className="toggle toggle-primary toggle-xs"
          checked={lesson.is_active}
          onChange={onToggleActive}
        />
      </td>
      <td className="text-center">
        {lesson.video_url ? (
          <span className="badge badge-sm badge-success badge-outline">Є</span>
        ) : (
          <span className="badge badge-sm badge-ghost">Немає</span>
        )}
      </td>
      <td>
        <div className="flex gap-1 justify-end">
          <button
            className="btn btn-ghost btn-xs btn-square"
            onClick={onEdit}
            title="Редагувати"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            className="btn btn-ghost btn-xs btn-square text-error"
            onClick={onDelete}
            title="Видалити"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function AdminCoursesPage() {
  const toast = useToast()

  const [stats, setStats] = useState<CoursesStats | null>(null)
  const [courses, setCourses] = useState<AdminCourse[]>([])
  const [selectedCourse, setSelectedCourse] = useState<AdminCourse | null>(null)
  const [lessons, setLessons] = useState<AdminLesson[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingLessons, setLoadingLessons] = useState(false)

  const [editingCourse, setEditingCourse] = useState<AdminCourse | null>(null)
  const [creatingCourse, setCreatingCourse] = useState(false)
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null)
  const [creatingLesson, setCreatingLesson] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get<CoursesStats>('/admin/courses/stats/')
      setStats(data)
    } catch {
      toast.add('Помилка завантаження статистики', 'error')
    }
  }, [toast])

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get<AdminCourse[]>('/admin/courses/courses/')
      setCourses(data)
    } catch {
      toast.add('Помилка завантаження курсів', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  const fetchLessons = useCallback(async (courseId: number) => {
    setLoadingLessons(true)
    try {
      const { data } = await api.get<AdminLesson[]>('/admin/courses/lessons/', {
        params: { course: courseId },
      })
      setLessons(data)
    } catch {
      toast.add('Помилка завантаження уроків', 'error')
    } finally {
      setLoadingLessons(false)
    }
  }, [toast])

  useEffect(() => {
    fetchStats()
    fetchCourses()
  }, [])

  useEffect(() => {
    if (selectedCourse) {
      fetchLessons(selectedCourse.id)
    }
  }, [selectedCourse])

  // --- DnD handlers ---
  const handleCoursesDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = courses.findIndex(c => c.id === active.id)
    const newIndex = courses.findIndex(c => c.id === over.id)
    const reordered = arrayMove(courses, oldIndex, newIndex)
    setCourses(reordered)

    try {
      await api.post('/admin/courses/courses/reorder/', {
        ordered_ids: reordered.map(c => c.id),
      })
    } catch {
      toast.add('Помилка зміни порядку', 'error')
      fetchCourses()
    }
  }

  const handleLessonsDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = lessons.findIndex(l => l.id === active.id)
    const newIndex = lessons.findIndex(l => l.id === over.id)
    const reordered = arrayMove(lessons, oldIndex, newIndex)
    setLessons(reordered)

    try {
      await api.post('/admin/courses/lessons/reorder/', {
        ordered_ids: reordered.map(l => l.id),
      })
    } catch {
      toast.add('Помилка зміни порядку', 'error')
      if (selectedCourse) fetchLessons(selectedCourse.id)
    }
  }

  const handleDeleteCourse = async (course: AdminCourse) => {
    if (!confirm(`Видалити курс "${course.title}" та всі його уроки? Цю дію не можна скасувати.`)) return
    try {
      await api.delete(`/admin/courses/courses/${course.id}/`)
      toast.add('Курс видалено', 'success')
      if (selectedCourse?.id === course.id) {
        setSelectedCourse(null)
        setLessons([])
      }
      fetchCourses()
      fetchStats()
    } catch {
      toast.add('Помилка видалення', 'error')
    }
  }

  const handleToggleCourseActive = async (course: AdminCourse) => {
    try {
      await api.patch(`/admin/courses/courses/${course.id}/`, {
        is_active: !course.is_active,
      })
      toast.add(course.is_active ? 'Курс приховано' : 'Курс активовано', 'success')
      fetchCourses()
      fetchStats()
    } catch {
      toast.add('Помилка оновлення', 'error')
    }
  }

  const handleDeleteLesson = async (lesson: AdminLesson) => {
    if (!confirm(`Видалити урок "${lesson.title}"?`)) return
    try {
      await api.delete(`/admin/courses/lessons/${lesson.id}/`)
      toast.add('Урок видалено', 'success')
      if (selectedCourse) fetchLessons(selectedCourse.id)
      fetchCourses()
      fetchStats()
    } catch {
      toast.add('Помилка видалення', 'error')
    }
  }

  const handleToggleLessonFree = async (lesson: AdminLesson) => {
    try {
      await api.patch(`/admin/courses/lessons/${lesson.id}/`, {
        is_free: !lesson.is_free,
      })
      toast.add(lesson.is_free ? 'Урок тепер платний' : 'Урок тепер безкоштовний', 'success')
      if (selectedCourse) fetchLessons(selectedCourse.id)
    } catch {
      toast.add('Помилка оновлення', 'error')
    }
  }

  const handleToggleLessonActive = async (lesson: AdminLesson) => {
    try {
      await api.patch(`/admin/courses/lessons/${lesson.id}/`, {
        is_active: !lesson.is_active,
      })
      toast.add(lesson.is_active ? 'Урок приховано' : 'Урок активовано', 'success')
      if (selectedCourse) fetchLessons(selectedCourse.id)
    } catch {
      toast.add('Помилка оновлення', 'error')
    }
  }

  const handleCourseSaved = () => {
    setEditingCourse(null)
    setCreatingCourse(false)
    fetchCourses()
    fetchStats()
  }

  const handleLessonSaved = () => {
    setEditingLessonId(null)
    setCreatingLesson(false)
    if (selectedCourse) fetchLessons(selectedCourse.id)
    fetchCourses()
    fetchStats()
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Відеокурси</h1>
          <p className="text-base-content/60 text-sm mt-1">
            {stats
              ? `${stats.total_courses} курсів, ${stats.total_lessons} уроків`
              : 'Завантаження...'}
          </p>
        </div>
        <button
          className="btn btn-sm btn-primary gap-2"
          onClick={() => setCreatingCourse(true)}
        >
          <Plus className="w-4 h-4" />
          Додати курс
        </button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="card bg-base-100 border border-base-300/60 p-4">
          <p className="text-2xl font-bold">{stats?.total_courses ?? 0}</p>
          <p className="text-xs text-base-content/50">Курсів</p>
        </div>
        <div className="card bg-base-100 border border-base-300/60 p-4">
          <p className="text-2xl font-bold">{stats?.total_lessons ?? 0}</p>
          <p className="text-xs text-base-content/50">Уроків</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Courses sidebar */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="card bg-base-100 border border-base-300/60 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
            <div className="card-body p-3">
              <h3 className="font-semibold text-sm px-1 mb-2">Курси</h3>
              {loading ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-sm" />
                </div>
              ) : courses.length === 0 ? (
                <p className="text-sm text-base-content/50 text-center py-4">
                  Немає курсів
                </p>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleCoursesDragEnd}
                >
                  <SortableContext
                    items={courses.map(c => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {courses.map(course => (
                      <SortableCourseItem
                        key={course.id}
                        course={course}
                        isSelected={selectedCourse?.id === course.id}
                        onSelect={() => setSelectedCourse(course)}
                        onToggleActive={() => handleToggleCourseActive(course)}
                        onEdit={() => setEditingCourse(course)}
                        onDelete={() => handleDeleteCourse(course)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        </div>

        {/* Lessons area */}
        <div className="flex-1 min-w-0">
          {!selectedCourse ? (
            <div className="card bg-base-100 border border-base-300/60">
              <div className="card-body items-center text-center py-16">
                <Video className="w-12 h-12 text-base-content/20 mb-4" />
                <p className="text-base-content/50">
                  Оберіть курс зліва для перегляду та редагування уроків
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Course header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button
                    className="btn btn-ghost btn-sm btn-square lg:hidden"
                    onClick={() => setSelectedCourse(null)}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h2 className="text-lg font-bold">{selectedCourse.title}</h2>
                    {selectedCourse.description && (
                      <p className="text-sm text-base-content/60 line-clamp-1">{selectedCourse.description}</p>
                    )}
                  </div>
                </div>
                <button
                  className="btn btn-sm btn-primary gap-2"
                  onClick={() => setCreatingLesson(true)}
                >
                  <Plus className="w-4 h-4" />
                  Додати урок
                </button>
              </div>

              {/* Lessons list */}
              <div className="card bg-base-100 border border-base-300/60 overflow-hidden">
                {loadingLessons ? (
                  <div className="flex justify-center py-12">
                    <span className="loading loading-spinner loading-md" />
                  </div>
                ) : lessons.length === 0 ? (
                  <div className="text-center py-12 text-base-content/50">
                    <p>Немає уроків у цьому курсі</p>
                    <button
                      className="btn btn-sm btn-primary mt-4 gap-2"
                      onClick={() => setCreatingLesson(true)}
                    >
                      <Plus className="w-4 h-4" />
                      Створити перший урок
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleLessonsDragEnd}
                    >
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th className="w-8" />
                            <th className="w-10">#</th>
                            <th>Назва</th>
                            <th className="w-24">Тривалість</th>
                            <th className="w-20 text-center">Безкоштовно</th>
                            <th className="w-20 text-center">Активний</th>
                            <th className="w-24 text-center">Відео</th>
                            <th className="w-20" />
                          </tr>
                        </thead>
                        <SortableContext
                          items={lessons.map(l => l.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <tbody>
                            {lessons.map((lesson, idx) => (
                              <SortableLessonRow
                                key={lesson.id}
                                lesson={lesson}
                                index={idx}
                                onEdit={() => setEditingLessonId(lesson.id)}
                                onDelete={() => handleDeleteLesson(lesson)}
                                onToggleFree={() => handleToggleLessonFree(lesson)}
                                onToggleActive={() => handleToggleLessonActive(lesson)}
                              />
                            ))}
                          </tbody>
                        </SortableContext>
                      </table>
                    </DndContext>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {(creatingCourse || editingCourse) && (
        <CourseModal
          course={editingCourse}
          onClose={() => { setEditingCourse(null); setCreatingCourse(false) }}
          onSaved={handleCourseSaved}
        />
      )}

      {(creatingLesson || editingLessonId !== null) && selectedCourse && (
        <LessonModal
          lessonId={editingLessonId}
          courseId={selectedCourse.id}
          onClose={() => { setEditingLessonId(null); setCreatingLesson(false) }}
          onSaved={handleLessonSaved}
        />
      )}
    </div>
  )
}
