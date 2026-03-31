'use client'

import { X, UserPlus, UserMinus, Crown } from 'lucide-react'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { chatApi } from '@/lib/chat-api'

interface Props {
  open: boolean
  onClose: () => void
}

export default function GroupInfoPanel({ open, onClose }: Props) {
  const { rooms, activeRoomId, onlineUserIds } = useChatStore()
  const user = useAuthStore((s) => s.user)

  if (!open || !activeRoomId) return null

  const room = rooms.find((r) => r.id === activeRoomId)
  if (!room || room.type !== 'group') return null

  const myParticipant = room.participants.find((p) => p.user.id === user?.id)
  const isAdmin = myParticipant?.role === 'admin'

  const handleRemove = async (userId: number) => {
    if (!confirm('Видалити учасника з групи?')) return
    try {
      await chatApi.removeParticipant(activeRoomId, userId)
      // rooms will be refreshed via WS or next fetch
    } catch {
      // error
    }
  }

  const roleLabel = (role: string) => {
    if (role === 'teacher') return 'Викладач'
    if (role === 'admin') return 'Адмін'
    return 'Учень'
  }

  return (
    <div className="w-72 border-l border-base-300/40 flex flex-col bg-base-100 overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b border-base-300/40">
        <h3 className="font-semibold text-sm">Інформація</h3>
        <button onClick={onClose} className="btn btn-ghost btn-xs btn-circle">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4">
        <div className="avatar placeholder mx-auto block text-center mb-3">
          <div className="w-16 h-16 rounded-full bg-secondary text-secondary-content mx-auto">
            <span className="text-xl">{(room.title?.[0] || 'Г').toUpperCase()}</span>
          </div>
        </div>
        <h4 className="text-center font-semibold">{room.title}</h4>
        <p className="text-center text-xs text-base-content/50 mt-0.5">
          {room.participants.length} учасників
        </p>
      </div>

      <div className="px-3 pb-2">
        <p className="text-xs font-medium text-base-content/60 px-1 mb-1">Учасники</p>
        <div className="space-y-0.5">
          {room.participants.map((p) => {
            const isOnline = onlineUserIds.has(p.user.id)
            const isSelf = p.user.id === user?.id
            return (
              <div key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-base-200/40">
                <div className="relative flex-shrink-0">
                  <div className="avatar placeholder">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-content">
                      <span className="text-xs">{(p.user.first_name?.[0] || p.user.username[0]).toUpperCase()}</span>
                    </div>
                  </div>
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-base-100" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate flex items-center gap-1">
                    {p.user.first_name ? `${p.user.first_name} ${p.user.last_name}`.trim() : p.user.username}
                    {isSelf && <span className="text-xs text-base-content/40">(ви)</span>}
                    {p.role === 'admin' && <Crown className="w-3 h-3 text-warning" />}
                  </p>
                  <p className="text-xs text-base-content/40">{roleLabel(p.user.role)}</p>
                </div>
                {isAdmin && !isSelf && (
                  <button
                    onClick={() => handleRemove(p.user.id)}
                    className="btn btn-ghost btn-xs btn-circle text-error opacity-0 group-hover:opacity-100"
                    title="Видалити"
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
