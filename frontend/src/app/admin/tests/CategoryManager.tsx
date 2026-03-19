'use client'

import { useState } from 'react'
import { X, Plus, Pencil, Trash2, Check, GripVertical } from 'lucide-react'
import api from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import type { TestCategory } from '@/types/testing'

interface Props {
  categories: TestCategory[]
  onClose: () => void
  onChanged: () => void
}

export default function CategoryManager({ categories: initial, onClose, onChanged }: Props) {
  const toast = useToast()
  const [categories, setCategories] = useState(initial)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)

  const startEdit = (cat: TestCategory) => {
    setEditingId(cat.id)
    setEditName(cat.name)
  }

  const saveEdit = async () => {
    if (!editName.trim() || !editingId) return
    setSaving(true)
    try {
      const { data } = await api.patch<TestCategory>(`/admin/tests/categories/${editingId}/`, {
        name: editName.trim(),
      })
      setCategories(prev => prev.map(c => c.id === editingId ? data : c))
      setEditingId(null)
      toast.add('Категорію оновлено', 'success')
    } catch (err: any) {
      toast.add(err.response?.data?.name?.[0] || 'Помилка', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleCreate = async () => {
    if (!newName.trim()) return
    setSaving(true)
    try {
      const { data } = await api.post<TestCategory>('/admin/tests/categories/', {
        name: newName.trim(),
        order: categories.length,
      })
      setCategories(prev => [...prev, data])
      setNewName('')
      setCreating(false)
      toast.add('Категорію створено', 'success')
    } catch (err: any) {
      toast.add(err.response?.data?.name?.[0] || 'Помилка створення', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (cat: TestCategory) => {
    if (cat.question_count > 0) {
      toast.add(`Категорія містить ${cat.question_count} питань. Спочатку перемістіть їх.`, 'error')
      return
    }
    if (!confirm(`Видалити категорію "${cat.name}"?`)) return
    try {
      await api.delete(`/admin/tests/categories/${cat.id}/`)
      setCategories(prev => prev.filter(c => c.id !== cat.id))
      toast.add('Категорію видалено', 'success')
    } catch (err: any) {
      toast.add(err.response?.data?.message || 'Помилка видалення', 'error')
    }
  }

  const handleClose = () => {
    onChanged()
    onClose()
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3" onClick={handleClose}>
          <X className="w-4 h-4" />
        </button>

        <h3 className="font-bold text-lg mb-4">Управління категоріями</h3>

        <div className="space-y-1 mb-4">
          {categories.map(cat => (
            <div
              key={cat.id}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-base-200 group"
            >
              {editingId === cat.id ? (
                <>
                  <input
                    type="text"
                    className="input input-bordered input-sm flex-1"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveEdit()}
                    autoFocus
                  />
                  <button className="btn btn-sm btn-success btn-square" onClick={saveEdit} disabled={saving}>
                    <Check className="w-4 h-4" />
                  </button>
                  <button className="btn btn-sm btn-ghost btn-square" onClick={() => setEditingId(null)}>
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm">{cat.name}</span>
                  <span className="text-xs text-base-content/40 mr-2">{cat.question_count} пит.</span>
                  <button
                    className="btn btn-ghost btn-xs btn-square opacity-0 group-hover:opacity-100"
                    onClick={() => startEdit(cat)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    className="btn btn-ghost btn-xs btn-square text-error opacity-0 group-hover:opacity-100"
                    onClick={() => handleDelete(cat)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          ))}

          {categories.length === 0 && (
            <p className="text-center text-sm text-base-content/50 py-6">Немає категорій</p>
          )}
        </div>

        {creating ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="input input-bordered input-sm flex-1"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="Назва категорії"
              autoFocus
            />
            <button className="btn btn-sm btn-primary" onClick={handleCreate} disabled={saving}>
              {saving ? <span className="loading loading-spinner loading-xs" /> : 'Створити'}
            </button>
            <button className="btn btn-sm btn-ghost" onClick={() => { setCreating(false); setNewName('') }}>
              Скасувати
            </button>
          </div>
        ) : (
          <button className="btn btn-sm btn-outline gap-2 w-full" onClick={() => setCreating(true)}>
            <Plus className="w-4 h-4" />
            Додати категорію
          </button>
        )}

        <div className="modal-action">
          <button className="btn btn-sm" onClick={handleClose}>Закрити</button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={handleClose} />
    </div>
  )
}
