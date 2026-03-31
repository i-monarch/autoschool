'use client'

import { useState } from 'react'
import { Download, FileText, Pencil, Trash2 } from 'lucide-react'
import type { Message } from '@/types/chat'

interface Props {
  message: Message
  isOwn: boolean
  showSender: boolean
  onImageClick?: (url: string) => void
  onEdit?: (msg: Message) => void
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
  const [showMenu, setShowMenu] = useState(false)

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
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} px-4 py-0.5 group`}>
      <div
        className={`max-w-[75%] relative ${isOwn ? 'order-1' : ''}`}
        onMouseEnter={() => isOwn && setShowMenu(true)}
        onMouseLeave={() => setShowMenu(false)}
      >
        {showSender && !isOwn && message.sender && (
          <p className="text-xs font-medium text-primary mb-0.5 px-1">
            {message.sender.first_name || message.sender.username}
          </p>
        )}

        {message.parent && (
          <div className={`mx-1 mb-1 px-2 py-1 rounded-lg border-l-2 border-primary/40 bg-base-200/50 text-xs`}>
            <span className="font-medium text-primary/70">
              {message.parent.sender?.first_name || 'Видалений'}
            </span>
            <p className="text-base-content/50 truncate">{message.parent.text}</p>
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
                    className="rounded-lg max-w-full cursor-pointer hover:opacity-90 transition-opacity"
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

          {message.text && <p className="whitespace-pre-wrap">{message.text}</p>}

          <div className={`flex items-center justify-end gap-1 mt-0.5 ${isOwn ? 'text-primary-content/60' : 'text-base-content/40'}`}>
            {message.is_edited && <span className="text-[10px]">ред.</span>}
            <span className="text-[10px]">{formatTime(message.created_at)}</span>
          </div>
        </div>

        {isOwn && showMenu && (
          <div className="absolute -left-16 top-1 flex gap-0.5 z-10">
            <button
              onClick={() => onEdit?.(message)}
              className="btn btn-ghost btn-xs btn-circle"
              title="Редагувати"
            >
              <Pencil className="w-3 h-3" />
            </button>
            <button
              onClick={() => onDelete?.(message)}
              className="btn btn-ghost btn-xs btn-circle text-error"
              title="Видалити"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
