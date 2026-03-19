'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Search, Plus, Trash2, FolderInput, Image, ChevronLeft,
  ChevronRight, Check, X, MoreVertical, Pencil, FolderPlus,
} from 'lucide-react'
import api from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import type {
  TestCategory, QuestionListItem, PaginatedResponse, AdminTestStats,
} from '@/types/testing'
import QuestionModal from './QuestionModal'
import CategoryManager from './CategoryManager'
import BulkMoveModal from './BulkMoveModal'

export default function AdminTestsPage() {
  const toast = useToast()

  const [stats, setStats] = useState<AdminTestStats | null>(null)
  const [categories, setCategories] = useState<TestCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [questions, setQuestions] = useState<QuestionListItem[]>([])
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [editingId, setEditingId] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [showBulkMove, setShowBulkMove] = useState(false)

  const pageSize = 50

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get<AdminTestStats>('/admin/tests/stats/')
      setStats(data)
      setCategories(data.categories)
    } catch {
      toast.add('Помилка завантаження статистики', 'error')
    }
  }, [toast])

  const fetchQuestions = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page, page_size: pageSize }
      if (selectedCategory) params.category = selectedCategory
      if (search) params.search = search
      const { data } = await api.get<PaginatedResponse<QuestionListItem>>(
        '/admin/tests/questions/', { params }
      )
      setQuestions(data.results)
      setTotalQuestions(data.count)
    } catch {
      toast.add('Помилка завантаження питань', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, selectedCategory, search, toast])

  useEffect(() => { fetchStats() }, [])
  useEffect(() => { fetchQuestions() }, [page, selectedCategory, search])

  useEffect(() => { setPage(1); setSelected(new Set()) }, [selectedCategory, search])

  const totalPages = Math.ceil(totalQuestions / pageSize)

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selected.size === questions.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(questions.map(q => q.id)))
    }
  }

  const handleBulkDelete = async () => {
    if (!selected.size) return
    if (!confirm(`Видалити ${selected.size} питань? Цю дію не можна скасувати.`)) return
    try {
      await api.post('/admin/tests/questions/bulk-delete/', {
        question_ids: Array.from(selected),
      })
      toast.add(`Видалено ${selected.size} питань`, 'success')
      setSelected(new Set())
      fetchQuestions()
      fetchStats()
    } catch {
      toast.add('Помилка видалення', 'error')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Видалити це питання?')) return
    try {
      await api.delete(`/admin/tests/questions/${id}/`)
      toast.add('Питання видалено', 'success')
      fetchQuestions()
      fetchStats()
    } catch {
      toast.add('Помилка видалення', 'error')
    }
  }

  const handleQuestionSaved = () => {
    setEditingId(null)
    setCreating(false)
    fetchQuestions()
    fetchStats()
  }

  const handleCategoriesChanged = () => {
    setShowCategoryManager(false)
    fetchStats()
    fetchQuestions()
  }

  const handleBulkMoved = () => {
    setShowBulkMove(false)
    setSelected(new Set())
    fetchQuestions()
    fetchStats()
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Тести</h1>
          <p className="text-base-content/60 text-sm mt-1">
            {stats ? `${stats.total_questions} питань у ${stats.total_categories} категоріях` : 'Завантаження...'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-sm btn-outline gap-2"
            onClick={() => setShowCategoryManager(true)}
          >
            <FolderPlus className="w-4 h-4" />
            Категорії
          </button>
          <button
            className="btn btn-sm btn-primary gap-2"
            onClick={() => setCreating(true)}
          >
            <Plus className="w-4 h-4" />
            Додати питання
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="card bg-base-100 border border-base-300/60 p-4">
          <p className="text-2xl font-bold">{stats?.total_questions ?? 0}</p>
          <p className="text-xs text-base-content/50">Питань</p>
        </div>
        <div className="card bg-base-100 border border-base-300/60 p-4">
          <p className="text-2xl font-bold">{stats?.total_categories ?? 0}</p>
          <p className="text-xs text-base-content/50">Категорій</p>
        </div>
        <div className="card bg-base-100 border border-base-300/60 p-4">
          <p className="text-2xl font-bold">{selected.size}</p>
          <p className="text-xs text-base-content/50">Обрано</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Category sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="card bg-base-100 border border-base-300/60 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
            <div className="card-body p-3">
              <h3 className="font-semibold text-sm px-1 mb-2">Категорії</h3>
              <button
                className={`text-left px-3 py-2 rounded-lg text-sm transition-colors w-full ${
                  !selectedCategory ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-base-200'
                }`}
                onClick={() => setSelectedCategory(null)}
              >
                Усі питання
                <span className="float-right text-xs opacity-60">{stats?.total_questions ?? 0}</span>
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`text-left px-3 py-2 rounded-lg text-sm transition-colors w-full ${
                    selectedCategory === cat.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-base-200'
                  }`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <span className="truncate block pr-8">{cat.name}</span>
                  <span className="float-right text-xs opacity-60 -mt-5">{cat.question_count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Questions table */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
              <input
                type="text"
                placeholder="Пошук за текстом або номером..."
                className="input input-bordered input-sm w-full pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {selected.size > 0 && (
              <div className="flex gap-2">
                <button
                  className="btn btn-sm btn-outline gap-1"
                  onClick={() => setShowBulkMove(true)}
                >
                  <FolderInput className="w-4 h-4" />
                  Перемістити ({selected.size})
                </button>
                <button
                  className="btn btn-sm btn-error btn-outline gap-1"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="w-4 h-4" />
                  Видалити ({selected.size})
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="card bg-base-100 border border-base-300/60 overflow-hidden">
            <table className="table table-sm table-fixed w-full">
              <thead>
                <tr>
                  <th className="w-10">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={questions.length > 0 && selected.size === questions.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="w-14">#</th>
                  <th>Питання</th>
                  <th className="w-48 hidden md:table-cell">Категорія</th>
                  <th className="w-10 text-center hidden sm:table-cell">
                    <Image className="w-4 h-4 mx-auto" />
                  </th>
                  <th className="w-16" />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <span className="loading loading-spinner loading-md" />
                    </td>
                  </tr>
                ) : questions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-base-content/50">
                      {search ? 'Нічого не знайдено' : 'Немає питань'}
                    </td>
                  </tr>
                ) : (
                  questions.map(q => (
                    <tr key={q.id} className={`hover ${selected.has(q.id) ? 'bg-primary/5' : ''}`}>
                      <td>
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={selected.has(q.id)}
                          onChange={() => toggleSelect(q.id)}
                        />
                      </td>
                      <td className="font-mono text-xs">{q.number}</td>
                      <td className="truncate text-sm">{q.text}</td>
                      <td className="hidden md:table-cell">
                        <span className="badge badge-ghost badge-sm truncate max-w-full block">
                          {q.category_name}
                        </span>
                      </td>
                      <td className="text-center hidden sm:table-cell">
                        {q.has_image ? (
                          <Check className="w-4 h-4 text-success mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-base-content/20 mx-auto" />
                        )}
                      </td>
                      <td>
                        <div className="flex gap-1 justify-end">
                          <button
                            className="btn btn-ghost btn-xs btn-square"
                            onClick={() => setEditingId(q.id)}
                            title="Редагувати"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className="btn btn-ghost btn-xs btn-square text-error"
                            onClick={() => handleDelete(q.id)}
                            title="Видалити"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-base-content/50">
                {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalQuestions)} з {totalQuestions}
              </p>
              <div className="join">
                <button
                  className="join-item btn btn-sm"
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="join-item btn btn-sm btn-disabled">
                  {page} / {totalPages}
                </button>
                <button
                  className="join-item btn btn-sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {(editingId !== null || creating) && (
        <QuestionModal
          questionId={editingId}
          categories={categories}
          defaultCategory={selectedCategory}
          onClose={() => { setEditingId(null); setCreating(false) }}
          onSaved={handleQuestionSaved}
        />
      )}

      {showCategoryManager && (
        <CategoryManager
          categories={categories}
          onClose={() => setShowCategoryManager(false)}
          onChanged={handleCategoriesChanged}
        />
      )}

      {showBulkMove && (
        <BulkMoveModal
          questionIds={Array.from(selected)}
          categories={categories}
          onClose={() => setShowBulkMove(false)}
          onMoved={handleBulkMoved}
        />
      )}
    </div>
  )
}
