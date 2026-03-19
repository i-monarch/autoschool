'use client'

import { useState } from 'react'
import { X, FolderInput } from 'lucide-react'
import api from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import type { TestCategory } from '@/types/testing'

interface Props {
  questionIds: number[]
  categories: TestCategory[]
  onClose: () => void
  onMoved: () => void
}

export default function BulkMoveModal({ questionIds, categories, onClose, onMoved }: Props) {
  const toast = useToast()
  const [categoryId, setCategoryId] = useState<number>(categories[0]?.id || 0)
  const [moving, setMoving] = useState(false)

  const handleMove = async () => {
    if (!categoryId) return
    setMoving(true)
    try {
      const { data } = await api.post('/admin/tests/questions/bulk-move/', {
        question_ids: questionIds,
        category_id: categoryId,
      })
      toast.add(`Переміщено ${data.moved} питань`, 'success')
      onMoved()
    } catch {
      toast.add('Помилка переміщення', 'error')
    } finally {
      setMoving(false)
    }
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-sm">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3" onClick={onClose}>
          <X className="w-4 h-4" />
        </button>

        <h3 className="font-bold text-lg mb-1">Перемістити питання</h3>
        <p className="text-sm text-base-content/60 mb-4">
          {questionIds.length} питань буде переміщено в обрану категорію
        </p>

        <select
          className="select select-bordered w-full mb-4"
          value={categoryId}
          onChange={e => setCategoryId(Number(e.target.value))}
        >
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name} ({c.question_count})</option>
          ))}
        </select>

        <div className="modal-action">
          <button className="btn btn-sm btn-ghost" onClick={onClose}>Скасувати</button>
          <button className="btn btn-sm btn-primary gap-2" onClick={handleMove} disabled={moving}>
            {moving ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <FolderInput className="w-4 h-4" />
            )}
            Перемістити
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  )
}
