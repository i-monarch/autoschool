'use client'

import { useState, useMemo } from 'react'
import { Search, Plus } from 'lucide-react'
import { useChatStore } from '@/stores/chat'
import ChatRoomItem from './ChatRoomItem'

interface Props {
  onNewChat: () => void
}

export default function ChatSidebar({ onNewChat }: Props) {
  const { rooms, roomsLoading } = useChatStore()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return rooms
    const q = search.toLowerCase()
    return rooms.filter((r) => {
      if (r.title?.toLowerCase().includes(q)) return true
      return r.participants.some((p) => {
        const name = `${p.user.first_name} ${p.user.last_name} ${p.user.username}`.toLowerCase()
        return name.includes(q)
      })
    })
  }, [rooms, search])

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-base-300/40 space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Пошук..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input input-bordered input-sm w-full pl-8"
            />
          </div>
          <button
            onClick={onNewChat}
            className="btn btn-primary btn-sm btn-square"
            title="Новий чат"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {roomsLoading && rooms.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <span className="loading loading-spinner loading-sm" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center p-4">
            <p className="text-sm text-base-content/40 text-center">
              {search ? 'Нічого не знайдено' : 'Немає чатів'}
            </p>
          </div>
        ) : (
          filtered.map((room) => (
            <ChatRoomItem key={room.id} room={room} />
          ))
        )}
      </div>
    </div>
  )
}
