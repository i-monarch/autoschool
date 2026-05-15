'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface RejectNoteModalProps {
  instructorName: string
  open: boolean
  saving: boolean
  onClose: () => void
  onConfirm: (note: string) => void
}

export default function RejectNoteModal({
  instructorName,
  open,
  saving,
  onClose,
  onConfirm,
}: RejectNoteModalProps) {
  const [note, setNote] = useState('')

  useEffect(() => {
    if (open) setNote('')
  }, [open])

  if (!open) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Відхилити заявку</h3>
          <button type="button" className="btn btn-ghost btn-sm btn-square" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-base-content/60 mb-3">
          Вкажіть причину відхилення для інструктора {instructorName}.
        </p>
        <textarea
          className="textarea textarea-bordered w-full min-h-28"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Наприклад: потрібно додати фото документів або уточнити дані авто"
        />
        <div className="modal-action">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Скасувати
          </button>
          <button
            type="button"
            className="btn btn-error"
            onClick={() => onConfirm(note.trim())}
            disabled={saving || !note.trim()}
          >
            {saving && <span className="loading loading-spinner loading-xs" />}
            Відхилити
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  )
}
