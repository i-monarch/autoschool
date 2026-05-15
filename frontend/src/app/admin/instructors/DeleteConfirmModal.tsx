'use client'

import { Trash2, X } from 'lucide-react'

interface DeleteConfirmModalProps {
  instructorName: string
  open: boolean
  saving: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteConfirmModal({
  instructorName,
  open,
  saving,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!open) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Видалити інструктора</h3>
          <button type="button" className="btn btn-ghost btn-sm btn-square" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
          <p className="text-sm text-base-content/70">
            Профіль інструктора {instructorName} буде видалено. Цю дію неможливо скасувати.
          </p>
        </div>
        <div className="modal-action">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Скасувати
          </button>
          <button type="button" className="btn btn-error" onClick={onConfirm} disabled={saving}>
            {saving && <span className="loading loading-spinner loading-xs" />}
            Видалити
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  )
}
