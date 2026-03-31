'use client'

import { create } from 'zustand'
import { chatApi } from '@/lib/chat-api'
import type { ChatRoom, Message } from '@/types/chat'

interface ChatState {
  rooms: ChatRoom[]
  activeRoomId: number | null
  messages: Message[]
  messagesLoading: boolean
  roomsLoading: boolean
  nextCursor: string | null
  hasMore: boolean
  onlineUserIds: Set<number>
  typingUsers: Record<number, number[]>
  totalUnread: number

  fetchRooms: () => Promise<void>
  setActiveRoom: (roomId: number | null) => void
  fetchMessages: (roomId: number) => Promise<void>
  loadMoreMessages: () => Promise<void>
  addIncomingMessage: (msg: Message) => void
  updateRoomOnMessage: (msg: Message) => void
  markRoomRead: (roomId: number) => void
  setOnline: (userId: number, online: boolean) => void
  setTyping: (roomId: number, userId: number, isTyping: boolean) => void
  addRoom: (room: ChatRoom) => void
  updateTotalUnread: () => void
  editMessage: (msgId: number, text: string) => void
  deleteMessage: (msgId: number) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  rooms: [],
  activeRoomId: null,
  messages: [],
  messagesLoading: false,
  roomsLoading: false,
  nextCursor: null,
  hasMore: false,
  onlineUserIds: new Set(),
  typingUsers: {},
  totalUnread: 0,

  fetchRooms: async () => {
    set({ roomsLoading: true })
    try {
      const rooms = await chatApi.getRooms()
      set({ rooms, roomsLoading: false })
      get().updateTotalUnread()
    } catch {
      set({ roomsLoading: false })
    }
  },

  setActiveRoom: (roomId) => {
    set({ activeRoomId: roomId, messages: [], nextCursor: null, hasMore: false })
    if (roomId) {
      get().fetchMessages(roomId)
    }
  },

  fetchMessages: async (roomId) => {
    set({ messagesLoading: true })
    try {
      const data = await chatApi.getMessages(roomId)
      set({
        messages: data.results.reverse(),
        nextCursor: data.next ? new URL(data.next).searchParams.get('cursor') : null,
        hasMore: !!data.next,
        messagesLoading: false,
      })
    } catch {
      set({ messagesLoading: false })
    }
  },

  loadMoreMessages: async () => {
    const { activeRoomId, nextCursor, hasMore, messagesLoading } = get()
    if (!activeRoomId || !hasMore || messagesLoading) return

    set({ messagesLoading: true })
    try {
      const data = await chatApi.getMessages(activeRoomId, nextCursor || undefined)
      set((state) => ({
        messages: [...data.results.reverse(), ...state.messages],
        nextCursor: data.next ? new URL(data.next).searchParams.get('cursor') : null,
        hasMore: !!data.next,
        messagesLoading: false,
      }))
    } catch {
      set({ messagesLoading: false })
    }
  },

  addIncomingMessage: (msg) => {
    const { activeRoomId } = get()
    if (msg.room === activeRoomId) {
      set((state) => ({
        messages: [...state.messages, msg],
      }))
    }
  },

  updateRoomOnMessage: (msg) => {
    set((state) => {
      const rooms = state.rooms.map((r) => {
        if (r.id !== msg.room) return r
        return {
          ...r,
          last_message_text: msg.text,
          last_message_type: msg.type,
          last_message_at: msg.created_at,
          last_message_sender_id: msg.sender?.id ?? null,
          unread_count: msg.room === state.activeRoomId ? r.unread_count : r.unread_count + 1,
          updated_at: msg.created_at,
        }
      })
      rooms.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      return { rooms }
    })
    get().updateTotalUnread()
  },

  markRoomRead: (roomId) => {
    set((state) => ({
      rooms: state.rooms.map((r) =>
        r.id === roomId ? { ...r, unread_count: 0 } : r
      ),
    }))
    get().updateTotalUnread()
  },

  setOnline: (userId, online) => {
    set((state) => {
      const next = new Set(state.onlineUserIds)
      if (online) next.add(userId)
      else next.delete(userId)
      return { onlineUserIds: next }
    })
  },

  setTyping: (roomId, userId, isTyping) => {
    set((state) => {
      const current = state.typingUsers[roomId] || []
      const next = isTyping
        ? [...current.filter((id) => id !== userId), userId]
        : current.filter((id) => id !== userId)
      return { typingUsers: { ...state.typingUsers, [roomId]: next } }
    })
  },

  addRoom: (room) => {
    set((state) => {
      if (state.rooms.some((r) => r.id === room.id)) return state
      return { rooms: [room, ...state.rooms] }
    })
  },

  updateTotalUnread: () => {
    const total = get().rooms.reduce((sum, r) => sum + (r.unread_count || 0), 0)
    set({ totalUnread: total })
  },

  editMessage: (msgId, text) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === msgId ? { ...m, text, is_edited: true } : m
      ),
    }))
  },

  deleteMessage: (msgId) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === msgId ? { ...m, is_deleted: true, text: '', attachments: [] } : m
      ),
    }))
  },
}))
