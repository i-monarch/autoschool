'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Plus, Pencil, Trash2, ChevronRight, GripVertical,
  BookOpen, FileText, ArrowLeft,
} from 'lucide-react'
import api from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import SectionModal from './SectionModal'
import ChapterModal from './ChapterModal'

interface TheorySection {
  id: number
  title: string
  slug: string
  description: string
  icon: string
  order: number
  chapters_count: number
}

interface TheoryChapter {
  id: number
  title: string
  slug: string
  number: number
  order: number
  section: number
  section_title: string
}

interface TheoryStats {
  total_sections: number
  total_chapters: number
  sections: { id: number; title: string; actual_chapters_count: number }[]
}

export default function AdminTheoryPage() {
  const toast = useToast()

  const [stats, setStats] = useState<TheoryStats | null>(null)
  const [sections, setSections] = useState<TheorySection[]>([])
  const [selectedSection, setSelectedSection] = useState<TheorySection | null>(null)
  const [chapters, setChapters] = useState<TheoryChapter[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingChapters, setLoadingChapters] = useState(false)

  // Modals
  const [editingSection, setEditingSection] = useState<TheorySection | null>(null)
  const [creatingSec, setCreatingSec] = useState(false)
  const [editingChapterId, setEditingChapterId] = useState<number | null>(null)
  const [creatingChapter, setCreatingChapter] = useState(false)

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get<TheoryStats>('/admin/theory/stats/')
      setStats(data)
    } catch {
      toast.add('Помилка завантаження статистики', 'error')
    }
  }, [toast])

  const fetchSections = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get<TheorySection[]>('/admin/theory/sections/')
      setSections(data)
    } catch {
      toast.add('Помилка завантаження розділів', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  const fetchChapters = useCallback(async (sectionId: number) => {
    setLoadingChapters(true)
    try {
      const { data } = await api.get<TheoryChapter[]>('/admin/theory/chapters/', {
        params: { section: sectionId },
      })
      setChapters(data)
    } catch {
      toast.add('Помилка завантаження глав', 'error')
    } finally {
      setLoadingChapters(false)
    }
  }, [toast])

  useEffect(() => {
    fetchStats()
    fetchSections()
  }, [])

  useEffect(() => {
    if (selectedSection) {
      fetchChapters(selectedSection.id)
    }
  }, [selectedSection])

  const handleDeleteSection = async (section: TheorySection) => {
    if (!confirm(`Видалити розділ "${section.title}" та всі його глави? Цю дію не можна скасувати.`)) return
    try {
      await api.delete(`/admin/theory/sections/${section.id}/`)
      toast.add('Розділ видалено', 'success')
      if (selectedSection?.id === section.id) {
        setSelectedSection(null)
        setChapters([])
      }
      fetchSections()
      fetchStats()
    } catch {
      toast.add('Помилка видалення', 'error')
    }
  }

  const handleDeleteChapter = async (chapter: TheoryChapter) => {
    if (!confirm(`Видалити главу "${chapter.title}"?`)) return
    try {
      await api.delete(`/admin/theory/chapters/${chapter.id}/`)
      toast.add('Главу видалено', 'success')
      if (selectedSection) fetchChapters(selectedSection.id)
      fetchSections()
      fetchStats()
    } catch {
      toast.add('Помилка видалення', 'error')
    }
  }

  const handleSectionSaved = () => {
    setEditingSection(null)
    setCreatingSec(false)
    fetchSections()
    fetchStats()
  }

  const handleChapterSaved = () => {
    setEditingChapterId(null)
    setCreatingChapter(false)
    if (selectedSection) fetchChapters(selectedSection.id)
    fetchSections()
    fetchStats()
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Теорія</h1>
          <p className="text-base-content/60 text-sm mt-1">
            {stats
              ? `${stats.total_sections} розділів, ${stats.total_chapters} глав`
              : 'Завантаження...'}
          </p>
        </div>
        <button
          className="btn btn-sm btn-primary gap-2"
          onClick={() => setCreatingSec(true)}
        >
          <Plus className="w-4 h-4" />
          Додати розділ
        </button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="card bg-base-100 border border-base-300/60 p-4">
          <p className="text-2xl font-bold">{stats?.total_sections ?? 0}</p>
          <p className="text-xs text-base-content/50">Розділів</p>
        </div>
        <div className="card bg-base-100 border border-base-300/60 p-4">
          <p className="text-2xl font-bold">{stats?.total_chapters ?? 0}</p>
          <p className="text-xs text-base-content/50">Глав</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sections sidebar */}
        <div className="lg:w-72 flex-shrink-0">
          <div className="card bg-base-100 border border-base-300/60 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
            <div className="card-body p-3">
              <h3 className="font-semibold text-sm px-1 mb-2">Розділи</h3>
              {loading ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-sm" />
                </div>
              ) : sections.length === 0 ? (
                <p className="text-sm text-base-content/50 text-center py-4">
                  Немає розділів
                </p>
              ) : (
                sections.map(section => (
                  <div
                    key={section.id}
                    className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                      selectedSection?.id === section.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-base-200'
                    }`}
                    onClick={() => setSelectedSection(section)}
                  >
                    <BookOpen className="w-4 h-4 flex-shrink-0 opacity-50" />
                    <span className="flex-1 truncate">{section.title}</span>
                    <span className="text-xs opacity-50">{section.chapters_count}</span>
                    <div className="hidden group-hover:flex gap-0.5">
                      <button
                        className="btn btn-ghost btn-xs btn-square"
                        onClick={e => { e.stopPropagation(); setEditingSection(section) }}
                        title="Редагувати"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        className="btn btn-ghost btn-xs btn-square text-error"
                        onClick={e => { e.stopPropagation(); handleDeleteSection(section) }}
                        title="Видалити"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Chapters area */}
        <div className="flex-1 min-w-0">
          {!selectedSection ? (
            <div className="card bg-base-100 border border-base-300/60">
              <div className="card-body items-center text-center py-16">
                <FileText className="w-12 h-12 text-base-content/20 mb-4" />
                <p className="text-base-content/50">
                  Оберіть розділ зліва для перегляду та редагування глав
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Section header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button
                    className="btn btn-ghost btn-sm btn-square lg:hidden"
                    onClick={() => setSelectedSection(null)}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h2 className="text-lg font-bold">{selectedSection.title}</h2>
                    {selectedSection.description && (
                      <p className="text-sm text-base-content/60">{selectedSection.description}</p>
                    )}
                  </div>
                </div>
                <button
                  className="btn btn-sm btn-primary gap-2"
                  onClick={() => setCreatingChapter(true)}
                >
                  <Plus className="w-4 h-4" />
                  Додати главу
                </button>
              </div>

              {/* Chapters list */}
              <div className="card bg-base-100 border border-base-300/60 overflow-hidden">
                {loadingChapters ? (
                  <div className="flex justify-center py-12">
                    <span className="loading loading-spinner loading-md" />
                  </div>
                ) : chapters.length === 0 ? (
                  <div className="text-center py-12 text-base-content/50">
                    <p>Немає глав у цьому розділі</p>
                    <button
                      className="btn btn-sm btn-primary mt-4 gap-2"
                      onClick={() => setCreatingChapter(true)}
                    >
                      <Plus className="w-4 h-4" />
                      Створити першу главу
                    </button>
                  </div>
                ) : (
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th className="w-14">#</th>
                        <th>Назва</th>
                        <th className="w-40 hidden sm:table-cell">Slug</th>
                        <th className="w-20" />
                      </tr>
                    </thead>
                    <tbody>
                      {chapters.map(chapter => (
                        <tr key={chapter.id} className="hover">
                          <td className="font-mono text-xs">{chapter.number}</td>
                          <td className="font-medium">{chapter.title}</td>
                          <td className="hidden sm:table-cell">
                            <span className="badge badge-ghost badge-sm font-mono">
                              {chapter.slug}
                            </span>
                          </td>
                          <td>
                            <div className="flex gap-1 justify-end">
                              <button
                                className="btn btn-ghost btn-xs btn-square"
                                onClick={() => setEditingChapterId(chapter.id)}
                                title="Редагувати"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                className="btn btn-ghost btn-xs btn-square text-error"
                                onClick={() => handleDeleteChapter(chapter)}
                                title="Видалити"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {(creatingSec || editingSection) && (
        <SectionModal
          section={editingSection}
          onClose={() => { setEditingSection(null); setCreatingSec(false) }}
          onSaved={handleSectionSaved}
        />
      )}

      {(creatingChapter || editingChapterId !== null) && selectedSection && (
        <ChapterModal
          chapterId={editingChapterId}
          sectionId={selectedSection.id}
          onClose={() => { setEditingChapterId(null); setCreatingChapter(false) }}
          onSaved={handleChapterSaved}
        />
      )}
    </div>
  )
}
