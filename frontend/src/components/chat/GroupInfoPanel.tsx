'use client'

import { useState, useEffect } from 'react'
import { X, UserPlus, UserMinus, Crown, Trash2, Search } from 'lucide-react'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { chatApi } from '@/lib/chat-api'
import type { ChatUser } from '@/types/chat'

interface Props {
  open: boolean
  onClose: () => void
}

export default function GroupInfoPanel({ open, onClose }: Props) {
  const { rooms, activeRoomId, onlineUserIds, fetchRooms, setActiveRoom } = useChatStore()
  const user = useAuthStore((s) => s.user)
  const [addingUser, setAddingUser] = useState(false)
  const [allUsers, setAllUsers] = useState<ChatUser[]>([])
  const [addSearch, setAddSearch] = useState('')
  const [removingId, setRemovingId] = useState<number | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (addingUser) {
      chatApi.getUsers().then((r) => setAllUsers(r as ChatUser[])).catch(() => {})
    }
  }, [addingUser])

  if (!open || !activeRoomId) return null

  const room = rooms.find((r) => r.id === activeRoomId)
  if (!room || room.type !== 'group') return null

  const myParticipant = room.participants.find((p) => p.user.id === user?.id)
  const isAdmin = myParticipant?.role === 'admin' || user?.role === 'admin'

  const participantIds = new Set(room.participants.map((p) => p.user.id))
  const availableUsers = allUsers.filter((u) => !participantIds.has(u.id))
  const filteredUsers = addSearch
    ? availableUsers.filter((u) => {
        const q = addSearch.toLowerCase()
        return u.first_name?.toLowerCase().includes(q) || u.last_name?.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)
      })
    : availableUsers

  const handleAddUser = async (userId: number) => {
    try {
      await chatApi.addParticipant(activeRoomId, userId)
      await fetchRooms()
      setAddingUser(false)
      setAddSearch('')
    } catch { /* error */ }
  }

  const handleRemove = async (userId: number) => {
    try {
      await chatApi.removeParticipant(activeRoomId, userId)
      await fetchRooms()
      setRemovingId(null)
    } catch { /* error */ }
  }

  const handleDeleteGroup = async () => {
    try {
      await chatApi.deleteRoom(activeRoomId)
      setActiveRoom(null)
      await fetchRooms()
      onClose()
    } catch { /* error */ }
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
          {room.write_access === 'staff' && ' · канал'}
        </p>
      </div>

      <div className="px-3 pb-2 flex-1">
        <div className="flex items-center justify-between px-1 mb-1">
          <p className="text-xs font-medium text-base-content/60">Учасники</p>
          {isAdmin && (
            <button
              onClick={() => setAddingUser(!addingUser)}
              className="btn btn-ghost btn-xs gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {addingUser ? 'Закрити' : 'Додати'}
            </button>
          )}
        </div>

        {addingUser && (
          <div className="mb-2 space-y-1">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-base-content/40" />
              <input
                type="text"
                placeholder="Фільтр..."
                value={addSearch}
                onChange={(e) => setAddSearch(e.target.value)}
                className="input input-bordered input-xs w-full pl-7"
              />
            </div>
            <div className="max-h-32 overflow-y-auto space-y-0.5">
              {filteredUsers.length === 0 ? (
                <p className="text-xs text-base-content/40 text-center py-2">Немає доступних</p>
              ) : (
                filteredUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleAddUser(u.id)}
                    className="w-full flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-base-200/60 text-left"
                  >
                    <div className="avatar placeholder">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-content">
                        <span className="text-xs">{(u.first_name?.[0] || u.username[0]).toUpperCase()}</span>
                      </div>
                    </div>
                    <span className="text-xs flex-1 truncate">
                      {u.first_name ? `${u.first_name} ${u.last_name}`.trim() : u.username}
                    </span>
                    <span className="text-[9px] text-base-content/40">{roleLabel(u.role)}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        <div className="space-y-0.5">
          {room.participants.map((p) => {
            const isOnline = onlineUserIds.has(p.user.id)
            const isSelf = p.user.id === user?.id
            return (
              <div key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-base-200/40 group">
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
                  removingId === p.user.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleRemove(p.user.id)} className="btn btn-error btn-xs h-6 min-h-0">Так</button>
                      <button onClick={() => setRemovingId(null)} className="btn btn-ghost btn-xs h-6 min-h-0">Ні</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRemovingId(p.user.id)}
                      className="btn btn-ghost btn-xs btn-circle text-error opacity-0 group-hover:opacity-100"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                    </button>
                  )
                )}
              </div>
            )
          })}
        </div>
      </div>

      {isAdmin && (
        <div className="px-3 py-3 border-t border-base-300/40">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-error flex-1">Видалити групу?</span>
              <button onClick={handleDeleteGroup} className="btn btn-error btn-xs">Так</button>
              <button onClick={() => setConfirmDelete(false)} className="btn btn-ghost btn-xs">Ні</button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="btn btn-ghost btn-sm w-full text-error gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Видалити групу
            </button>
          )}
        </div>
      )}
    </div>
  )
}
