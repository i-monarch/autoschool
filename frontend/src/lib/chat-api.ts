import api from './api'
import type { ChatRoom, CreateRoomData, Message, MessageAttachment } from '@/types/chat'

export const chatApi = {
  getRooms: () =>
    api.get<ChatRoom[]>('/chat/rooms/').then((r) => r.data),

  getRoom: (id: number) =>
    api.get<ChatRoom>(`/chat/rooms/${id}/`).then((r) => r.data),

  createRoom: (data: CreateRoomData) =>
    api.post<ChatRoom>('/chat/rooms/', data).then((r) => r.data),

  updateRoom: (id: number, data: { title: string }) =>
    api.patch<ChatRoom>(`/chat/rooms/${id}/`, data).then((r) => r.data),

  getMessages: (roomId: number, cursor?: string) => {
    const params = cursor ? { cursor } : {}
    return api
      .get<{ results: Message[]; next: string | null }>(`/chat/rooms/${roomId}/messages/`, { params })
      .then((r) => r.data)
  },

  sendMessage: (roomId: number, data: { text: string; type?: string; parent_id?: number; attachment_ids?: number[] }) =>
    api.post<Message>(`/chat/rooms/${roomId}/messages/`, data).then((r) => r.data),

  editMessage: (roomId: number, messageId: number, text: string) =>
    api.patch<Message>(`/chat/rooms/${roomId}/messages/${messageId}/edit/`, { text }).then((r) => r.data),

  deleteMessage: (roomId: number, messageId: number) =>
    api.delete(`/chat/rooms/${roomId}/messages/${messageId}/delete/`),

  markAsRead: (roomId: number) =>
    api.post(`/chat/rooms/${roomId}/read/`),

  addParticipant: (roomId: number, userId: number) =>
    api.post(`/chat/rooms/${roomId}/participants/`, { user_id: userId }),

  removeParticipant: (roomId: number, userId: number) =>
    api.delete(`/chat/rooms/${roomId}/participants/${userId}/`),

  uploadFile: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api
      .post<MessageAttachment>('/chat/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  searchMessages: (q: string) =>
    api.get<Message[]>('/chat/search/', { params: { q } }).then((r) => r.data),

  getUsers: (search?: string) =>
    api.get<{ id: number; username: string; first_name: string; last_name: string; role: string; avatar: string | null }[]>(
      '/chat/users/', { params: search ? { search } : {} }
    ).then((r) => r.data),
}
