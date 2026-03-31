'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, Download, FileText, Pencil, Trash2, X } from 'lucide-react'
import type { Message } from '@/types/chat'

interface Props {
  message: Message
  isOwn: boolean
  showSender: boolean
  onImageClick?: (url: string) => void
  onEdit?: (msgId: number, newText: string) => void
  onDelete?: (msg: Message) => void
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('uk', { hour: '2-digit', minute: '2-digit' })
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function MessageBubble({ message, isOwn, showSender, onImageClick, onEdit, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [editText, setEditText] = useState('')
  const editRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editing && editRef.current) {
      editRef.current.focus()
      editRef.current.selectionStart = editRef.current.value.length
    }
  }, [editing])

  const startEdit = () => {
    setEditText(message.text)
    setEditing(true)
    setConfirmingDelete(false)
  }

  const confirmEdit = () => {
    const trimmed = editText.trim()
    if (trimmed && trimmed !== message.text) {
      onEdit?.(message.id, trimmed)
    }
    setEditing(false)
  }

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      confirmEdit()
    }
    if (e.key === 'Escape') setEditing(false)
  }

  if (message.type === 'system') {
    return (
      <div className="text-center py-1">
        <span className="text-xs text-base-content/40">{message.text}</span>
      </div>
    )
  }

  if (message.is_deleted) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} px-4 py-0.5`}>
        <div className="px-3 py-1.5 rounded-xl bg-base-200/50 italic text-xs text-base-content/30">
          Повідомлення видалено
        </div>
      </div>
    )
  }

  const hasImages = message.attachments.some((a) => a.content_type.startsWith('image/'))
  const hasFiles = message.attachments.some((a) => !a.content_type.startsWith('image/'))

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-start gap-1 px-4 py-0.5 group`}>
      {/* Action buttons - before bubble for own messages */}
      {isOwn && !editing && !confirmingDelete && (
        <div className="flex items-center gap-0.5 pt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={startEdit}
            className="w-7 h-7 rounded-full bg-base-200 hover:bg-base-300 flex items-center justify-center transition-colors"
            title="Редагувати"
          >
            <Pencil className="w-3.5 h-3.5 text-base-content/60" />
          </button>
          <button
            onClick={() => setConfirmingDelete(true)}
            className="w-7 h-7 rounded-full bg-base-200 hover:bg-error/20 flex items-center justify-center transition-colors"
            title="Видалити"
          >
            <Trash2 className="w-3.5 h-3.5 text-base-content/60" />
          </button>
        </div>
      )}

      <div className={`max-w-[75%] relative`}>
        {showSender && !isOwn && message.sender && (
          <p className="text-xs font-medium text-primary mb-0.5 px-1">
            {message.sender.first_name || message.sender.username}
            {message.sender.role === 'admin' && (
              <span className="ml-1 text-[10px] font-normal bg-warning/20 text-warning-content px-1 py-0.5 rounded">Адмін</span>
            )}
          </p>
        )}

        {message.parent && (
          <div className="mx-1 mb-1 px-2 py-1 rounded-lg border-l-2 border-primary/40 bg-base-200/50 text-xs">
            <span className="font-medium text-primary/70">
              {message.parent.sender?.first_name || 'Видалений'}
            </span>
            <p className="text-base-content/50 truncate">{message.parent.text}</p>
          </div>
        )}

        {/* Delete confirmation */}
        {confirmingDelete && (
          <div className="mb-1.5 flex items-center gap-2 px-1">
            <span className="text-xs text-error">Видалити?</span>
            <button
              onClick={() => { onDelete?.(message); setConfirmingDelete(false) }}
              className="btn btn-xs btn-error gap-1 h-6 min-h-0"
            >
              <Trash2 className="w-3 h-3" />
              Так
            </button>
            <button
              onClick={() => setConfirmingDelete(false)}
              className="btn btn-xs btn-ghost h-6 min-h-0"
            >
              Ні
            </button>
          </div>
        )}

        <div
          className={`
            rounded-2xl px-3 py-2 text-sm break-words
            ${isOwn
              ? 'bg-primary text-primary-content rounded-br-md'
              : 'bg-base-200 rounded-bl-md'
            }
          `}
        >
          {hasImages && (
            <div className="space-y-1 mb-1">
              {message.attachments
                .filter((a) => a.content_type.startsWith('image/'))
                .map((a) => (
                  <img
                    key={a.id}
                    src={a.thumbnail || a.file}
                    alt={a.filename}
                    className="rounded-lg max-w-[200px] max-h-[200px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => onImageClick?.(a.file)}
                  />
                ))}
            </div>
          )}

          {hasFiles && (
            <div className="space-y-1 mb-1">
              {message.attachments
                .filter((a) => !a.content_type.startsWith('image/'))
                .map((a) => (
                  <a
                    key={a.id}
                    href={a.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                      flex items-center gap-2 px-2 py-1.5 rounded-lg
                      ${isOwn ? 'bg-primary-content/10 hover:bg-primary-content/20' : 'bg-base-300/50 hover:bg-base-300'}
                      transition-colors
                    `}
                  >
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{a.filename}</p>
                      <p className="text-[10px] opacity-60">{formatFileSize(a.file_size)}</p>
                    </div>
                    <Download className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
                  </a>
                ))}
            </div>
          )}

          {editing ? (
            <div>
              <textarea
                ref={editRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleEditKeyDown}
                className="w-full bg-white/10 rounded-lg px-2 py-1 border-0 outline-none resize-none text-sm leading-snug text-primary-content"
                rows={Math.min(editText.split('\n').length, 5)}
              />
              <div className="flex items-center justify-end gap-1.5 mt-1.5">
                <button
                  onClick={() => setEditing(false)}
                  className="btn btn-xs h-6 min-h-0 bg-white/10 border-0 text-primary-content/70 hover:bg-white/20 hover:text-primary-content gap-1"
                >
                  <X className="w-3 h-3" />
                  Скасувати
                </button>
                <button
                  onClick={confirmEdit}
                  className="btn btn-xs h-6 min-h-0 bg-white/25 border-0 text-primary-content hover:bg-white/35 gap-1"
                >
                  <Check className="w-3 h-3" />
                  Зберегти
                </button>
              </div>
            </div>
          ) : (
            message.text && <p className="whitespace-pre-wrap">{message.text}</p>
          )}

          {!editing && (
            <div className={`flex items-center justify-end gap-1 mt-0.5 ${isOwn ? 'text-primary-content/60' : 'text-base-content/40'}`}>
              {message.is_edited && <span className="text-[10px]">ред.</span>}
              <span className="text-[10px]">{formatTime(message.created_at)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
