'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Paperclip, Send, X } from 'lucide-react'
import { chatApi } from '@/lib/chat-api'
import FilePreview from './FilePreview'
import type { Message, WSOutgoing } from '@/types/chat'

interface FileItem {
  file: File
  preview?: string
}

interface Props {
  roomId: number
  send: (data: WSOutgoing) => void
  replyTo: Message | null
  onCancelReply: () => void
}

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
]

export default function MessageInput({ roomId, send, replyTo, onCancelReply }: Props) {
  const [text, setText] = useState('')
  const [files, setFiles] = useState<FileItem[]>([])
  const [uploading, setUploading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const typingTimer = useRef<ReturnType<typeof setTimeout>>()
  const isTyping = useRef(false)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [roomId, replyTo])

  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }, [])

  const handleTyping = useCallback(() => {
    if (!isTyping.current) {
      isTyping.current = true
      send({ type: 'typing.start', room_id: roomId })
    }
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      isTyping.current = false
      send({ type: 'typing.stop', room_id: roomId })
    }, 2000)
  }, [roomId, send])

  const handleSend = async () => {
    const trimmed = text.trim()
    if (!trimmed && files.length === 0) return

    setUploading(true)

    try {
      let attachmentIds: number[] = []
      if (files.length > 0) {
        const results = await Promise.all(files.map((f) => chatApi.uploadFile(f.file)))
        attachmentIds = results.map((r) => r.id)
      }

      const msgType = attachmentIds.length > 0 && !trimmed
        ? (files.some((f) => f.file.type.startsWith('image/')) ? 'image' : 'file')
        : 'text'

      send({
        type: 'message.send',
        room_id: roomId,
        text: trimmed,
        msg_type: msgType,
        attachment_ids: attachmentIds.length > 0 ? attachmentIds : undefined,
        parent_id: replyTo?.id,
      })

      setText('')
      setFiles([])
      onCancelReply()

      if (isTyping.current) {
        isTyping.current = false
        send({ type: 'typing.stop', room_id: roomId })
      }

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } catch {
      // upload error
    } finally {
      setUploading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    const valid = selected.filter(
      (f) => ALLOWED_TYPES.includes(f.type) && f.size <= 20 * 1024 * 1024
    )
    const items: FileItem[] = valid.map((f) => ({
      file: f,
      preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
    }))
    setFiles((prev) => [...prev, ...items])
    if (fileRef.current) fileRef.current.value = ''
  }

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const item = prev[index]
      if (item.preview) URL.revokeObjectURL(item.preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="border-t border-base-300/40">
      {replyTo && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-base-200/30 border-b border-base-300/20">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-primary">
              {replyTo.sender?.first_name || 'Видалений'}
            </p>
            <p className="text-xs text-base-content/50 truncate">{replyTo.text}</p>
          </div>
          <button onClick={onCancelReply} className="btn btn-ghost btn-xs btn-circle">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <FilePreview files={files} onRemove={removeFile} />

      <div className="flex items-end gap-2 p-3">
        <button
          onClick={() => fileRef.current?.click()}
          className="btn btn-ghost btn-sm btn-circle flex-shrink-0 self-end"
          title="Прикріпити файл"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.zip"
          onChange={handleFileSelect}
          className="hidden"
        />

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            autoResize()
            handleTyping()
          }}
          onKeyDown={handleKeyDown}
          placeholder="Написати повідомлення..."
          rows={1}
          className="textarea textarea-bordered textarea-sm flex-1 resize-none min-h-[2.25rem] max-h-[7.5rem] leading-snug"
        />

        <button
          onClick={handleSend}
          disabled={uploading || (!text.trim() && files.length === 0)}
          className="btn btn-primary btn-sm btn-circle flex-shrink-0 self-end"
        >
          {uploading ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  )
}
