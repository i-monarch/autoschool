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

  const isMyRoom = room.participants.some((p) => p.user.id === user?.id)
  const otherParticipant = room.type === 'direct'
    ? room.participants.find((p) => p.user.id !== user?.id)?.user
    : null

  const getName = (u: { first_name: string; last_name: string; username: string }) =>
    `${u.first_name} ${u.last_name}`.trim() || u.username

  const displayName = room.type === 'direct'
    ? (!isMyRoom && room.participants.length >= 2
        ? room.participants.map((p) => getName(p.user)).join(' / ')
        : otherParticipant ? getName(otherParticipant) : 'Чат')
    : room.title || 'Група'

  const isOnline = otherParticipant ? onlineUserIds.has(otherParticipant.id) : false

  const avatarLetter = displayName[0]?.toUpperCase() || '?'

  const roleLabel = !isMyRoom
    ? ''
    : otherParticipant?.role === 'teacher'
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
          <span className="font-medium text-sm truncate">
            {displayName}
            {room.write_access === 'staff' && (
              <span className="ml-1 text-[9px] font-normal text-base-content/40 align-middle">канал</span>
            )}
          </span>
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
            <span className="bg-primary text-primary-content text-[11px] font-bold rounded-full min-w-[1.25rem] h-5 px-1.5 flex items-center justify-center flex-shrink-0">
              {room.unread_count > 99 ? '99+' : room.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
