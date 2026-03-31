'use client'

import { useState } from 'react'
import { X, Search, Users, MessageCircle } from 'lucide-react'
import { chatApi } from '@/lib/chat-api'
import { useChatStore } from '@/stores/chat'
import type { ChatUser } from '@/types/chat'

interface Props {
  open: boolean
  onClose: () => void
}

export default function CreateChatModal({ open, onClose }: Props) {
  const [mode, setMode] = useState<'direct' | 'group'>('direct')
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState<ChatUser[]>([])
  const [loading, setLoading] = useState(false)
  const [groupTitle, setGroupTitle] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<ChatUser[]>([])
  const { addRoom, setActiveRoom } = useChatStore()

  if (!open) return null

  const handleSearch = async (q: string) => {
    setSearch(q)
    if (q.length < 2) {
      setUsers([])
      return
    }
    setLoading(true)
    try {
      const results = await chatApi.getUsers(q) as ChatUser[]
      setUsers(results)
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectDirect = async (user: ChatUser) => {
    try {
      const room = await chatApi.createRoom({ type: 'direct', user_id: user.id })
      addRoom(room)
      setActiveRoom(room.id)
      handleClose()
    } catch {
      // error
    }
  }

  const toggleUser = (user: ChatUser) => {
    setSelectedUsers((prev) =>
      prev.some((u) => u.id === user.id)
        ? prev.filter((u) => u.id !== user.id)
        : [...prev, user]
    )
  }

  const handleCreateGroup = async () => {
    if (!groupTitle.trim() || selectedUsers.length === 0) return
    try {
      const room = await chatApi.createRoom({
        type: 'group',
        title: groupTitle.trim(),
        participant_ids: selectedUsers.map((u) => u.id),
      })
      addRoom(room)
      setActiveRoom(room.id)
      handleClose()
    } catch {
      // error
    }
  }

  const handleClose = () => {
    setSearch('')
    setUsers([])
    setGroupTitle('')
    setSelectedUsers([])
    setMode('direct')
    onClose()
  }

  const roleLabel = (role: string) => {
    if (role === 'teacher') return 'Викладач'
    if (role === 'admin') return 'Адмін'
    return 'Учень'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={handleClose}>
      <div
        className="bg-base-100 rounded-2xl w-full max-w-md shadow-xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-base-300/40">
          <h3 className="font-semibold">Новий чат</h3>
          <button onClick={handleClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-1 px-4 pt-3">
          <button
            onClick={() => setMode('direct')}
            className={`btn btn-sm ${mode === 'direct' ? 'btn-primary' : 'btn-ghost'}`}
          >
            <MessageCircle className="w-4 h-4" />
            Особистий
          </button>
          <button
            onClick={() => setMode('group')}
            className={`btn btn-sm ${mode === 'group' ? 'btn-primary' : 'btn-ghost'}`}
          >
            <Users className="w-4 h-4" />
            Група
          </button>
        </div>

        {mode === 'group' && (
          <div className="px-4 pt-3">
            <input
              type="text"
              placeholder="Назва групи"
              value={groupTitle}
              onChange={(e) => setGroupTitle(e.target.value)}
              className="input input-bordered input-sm w-full"
            />
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedUsers.map((u) => (
                  <span key={u.id} className="badge badge-primary badge-sm gap-1">
                    {u.first_name || u.username}
                    <button onClick={() => toggleUser(u)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="px-4 pt-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Пошук користувача..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="input input-bordered input-sm w-full pl-8"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2 min-h-[200px]">
          {loading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-sm" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-sm text-base-content/40 py-8">
              {search.length < 2 ? 'Введіть мінімум 2 символи' : 'Нікого не знайдено'}
            </p>
          ) : (
            users.map((u) => {
              const isSelected = selectedUsers.some((s) => s.id === u.id)
              return (
                <button
                  key={u.id}
                  onClick={() => mode === 'direct' ? handleSelectDirect(u) : toggleUser(u)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                    ${isSelected ? 'bg-primary/10' : 'hover:bg-base-200/60'}
                  `}
                >
                  <div className="avatar placeholder">
                    <div className="w-9 h-9 rounded-full bg-primary text-primary-content">
                      <span className="text-sm">
                        {(u.first_name?.[0] || u.username[0]).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium truncate">
                      {u.first_name ? `${u.first_name} ${u.last_name}`.trim() : u.username}
                    </p>
                    <p className="text-xs text-base-content/50">{roleLabel(u.role)}</p>
                  </div>
                  {mode === 'group' && isSelected && (
                    <span className="badge badge-primary badge-xs">V</span>
                  )}
                </button>
              )
            })
          )}
        </div>

        {mode === 'group' && (
          <div className="px-4 py-3 border-t border-base-300/40">
            <button
              onClick={handleCreateGroup}
              disabled={!groupTitle.trim() || selectedUsers.length === 0}
              className="btn btn-primary btn-sm w-full"
            >
              Створити групу ({selectedUsers.length})
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
