'use client'

import { useState, useEffect } from 'react'
import { X, Search, Users, MessageCircle, UserPlus } from 'lucide-react'
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
  const [allUsers, setAllUsers] = useState<ChatUser[]>([])
  const [loading, setLoading] = useState(false)
  const [groupTitle, setGroupTitle] = useState('')
  const [writeAccess, setWriteAccess] = useState<'all' | 'staff'>('all')
  const [selectedUsers, setSelectedUsers] = useState<ChatUser[]>([])
  const { addRoom, setActiveRoom } = useChatStore()

  useEffect(() => {
    if (open) {
      loadUsers()
    }
  }, [open])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const results = await chatApi.getUsers() as ChatUser[]
      setAllUsers(results)
    } catch {
      setAllUsers([])
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  const filtered = search
    ? allUsers.filter((u) => {
        const q = search.toLowerCase()
        return (
          u.first_name?.toLowerCase().includes(q) ||
          u.last_name?.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q)
        )
      })
    : allUsers

  const handleSelectDirect = async (user: ChatUser) => {
    try {
      const room = await chatApi.createRoom({ type: 'direct', user_id: user.id })
      addRoom(room)
      setActiveRoom(room.id)
      handleClose()
    } catch { /* error */ }
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
        write_access: writeAccess,
        participant_ids: selectedUsers.map((u) => u.id),
      })
      addRoom(room)
      setActiveRoom(room.id)
      handleClose()
    } catch { /* error */ }
  }

  const handleClose = () => {
    setSearch('')
    setGroupTitle('')
    setWriteAccess('all')
    setSelectedUsers([])
    setMode('direct')
    onClose()
  }

  const roleLabel = (role: string) => {
    if (role === 'teacher') return 'Викладач'
    if (role === 'admin') return 'Адмін'
    return 'Учень'
  }

  const roleBadgeClass = (role: string) => {
    if (role === 'teacher') return 'bg-secondary/10 text-secondary'
    if (role === 'admin') return 'bg-warning/10 text-warning'
    return 'bg-base-200 text-base-content/60'
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
          <div className="px-4 pt-3 space-y-2">
            <input
              type="text"
              placeholder="Назва групи"
              value={groupTitle}
              onChange={(e) => setGroupTitle(e.target.value)}
              className="input input-bordered input-sm w-full"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-base-content/60 flex-shrink-0">Хто пише:</span>
              <select
                value={writeAccess}
                onChange={(e) => setWriteAccess(e.target.value as 'all' | 'staff')}
                className="select select-bordered select-xs flex-1"
              >
                <option value="all">Всі учасники</option>
                <option value="staff">Адміни та викладачі</option>
              </select>
            </div>
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-1">
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
              placeholder="Фільтр..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input input-bordered input-sm w-full pl-8"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2 min-h-[200px] max-h-[40vh]">
          {loading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-sm" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm text-base-content/40 py-8">
              Нікого не знайдено
            </p>
          ) : (
            filtered.map((u) => {
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
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${roleBadgeClass(u.role)}`}>
                    {roleLabel(u.role)}
                  </span>
                  {mode === 'group' && isSelected && (
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-content flex items-center justify-center text-xs">
                      ✓
                    </span>
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
