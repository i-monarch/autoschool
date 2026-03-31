'use client'

import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import type { ChatRoom } from '@/types/chat'

function formatTime(dateStr: string | null) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) {
    return d.toLocaleTimeString('uk', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('uk', { day: '2-digit', month: '2-digit' })
}

interface Props {
  room: ChatRoom
}

export default function ChatRoomItem({ room }: Props) {
  const { activeRoomId, setActiveRoom, onlineUserIds } = useChatStore()
  const user = useAuthStore((s) => s.user)
  const isActive = activeRoomId === room.id

  const otherParticipant = room.type === 'direct'
    ? room.participants.find((p) => p.user.id !== user?.id)?.user
    : null

  const displayName = room.type === 'direct'
    ? (otherParticipant
        ? `${otherParticipant.first_name} ${otherParticipant.last_name}`.trim() || otherParticipant.username
        : 'Чат')
    : room.title || 'Група'

  const isOnline = otherParticipant ? onlineUserIds.has(otherParticipant.id) : false

  const avatarLetter = displayName[0]?.toUpperCase() || '?'

  const roleLabel = otherParticipant?.role === 'teacher'
    ? 'Викладач'
    : otherParticipant?.role === 'admin'
      ? 'Адмін'
      : ''

  return (
    <button
      onClick={() => setActiveRoom(room.id)}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors
        ${isActive ? 'bg-primary/10' : 'hover:bg-base-200/60'}
      `}
    >
      <div className="relative flex-shrink-0">
        {otherParticipant?.avatar ? (
          <img
            src={otherParticipant.avatar}
            alt=""
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="avatar placeholder">
            <div className={`w-10 h-10 rounded-full ${room.type === 'group' ? 'bg-secondary text-secondary-content' : 'bg-primary text-primary-content'}`}>
              <span className="text-sm font-medium">{avatarLetter}</span>
            </div>
          </div>
        )}
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-100" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm truncate">{displayName}</span>
          <span className="text-xs text-base-content/40 flex-shrink-0">
            {formatTime(room.last_message_at)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-xs text-base-content/50 truncate">
            {roleLabel && <span className="text-primary/60">{roleLabel} · </span>}
            {room.last_message_type === 'image' ? 'Фото' : room.last_message_type === 'file' ? 'Файл' : room.last_message_text || 'Немає повідомлень'}
          </p>
          {(room.unread_count ?? 0) > 0 && (
            <span className="badge badge-primary badge-xs px-1.5 min-w-[1.25rem] text-center">
              {room.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
