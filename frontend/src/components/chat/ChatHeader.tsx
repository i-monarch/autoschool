'use client'

import { ArrowLeft, Users, Info } from 'lucide-react'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'

interface Props {
  onBack: () => void
  onInfo?: () => void
}

export default function ChatHeader({ onBack, onInfo }: Props) {
  const { rooms, activeRoomId, onlineUserIds, typingUsers } = useChatStore()
  const user = useAuthStore((s) => s.user)

  const room = rooms.find((r) => r.id === activeRoomId)
  if (!room) return null

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
  const typing = typingUsers[room.id] || []
  const typingFiltered = typing.filter((id) => id !== user?.id)

  const getStatusText = () => {
    if (typingFiltered.length > 0) {
      if (room.type === 'direct') return 'друкує...'
      const names = typingFiltered.map((id) => {
        const p = room.participants.find((pp) => pp.user.id === id)
        return p ? p.user.first_name || p.user.username : ''
      })
      return `${names.join(', ')} друкує...`
    }
    if (room.type === 'direct') {
      return isOnline ? 'онлайн' : ''
    }
    return `${room.participants.length} учасників`
  }

  const statusText = getStatusText()

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 border-b border-base-300/40 min-h-[3.5rem]">
      <button
        onClick={onBack}
        className="btn btn-ghost btn-sm btn-square md:hidden"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm truncate">{displayName}</h3>
        {statusText && (
          <p className={`text-xs ${typingFiltered.length > 0 ? 'text-primary' : 'text-base-content/50'}`}>
            {statusText}
          </p>
        )}
      </div>

      {room.type === 'group' && onInfo && (
        <button onClick={onInfo} className="btn btn-ghost btn-sm btn-square">
          <Info className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}
