export interface ChatUser {
  id: number
  username: string
  first_name: string
  last_name: string
  avatar: string | null
  role: 'student' | 'teacher' | 'admin'
}

export interface ChatParticipant {
  id: number
  user: ChatUser
  role: 'member' | 'admin'
  joined_at: string
}

export interface MessageAttachment {
  id: number
  file: string
  filename: string
  file_size: number
  content_type: string
  thumbnail: string | null
}

export interface ParentMessage {
  id: number
  text: string
  sender: ChatUser | null
}

export interface Message {
  id: number
  room: number
  sender: ChatUser | null
  type: 'text' | 'file' | 'image' | 'system'
  text: string
  parent: ParentMessage | null
  attachments: MessageAttachment[]
  is_edited: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface ChatRoom {
  id: number
  type: 'direct' | 'group'
  title: string
  avatar: string | null
  is_active: boolean
  participants: ChatParticipant[]
  last_message_text: string
  last_message_type: string
  last_message_at: string | null
  last_message_sender_id: number | null
  unread_count: number
  created_at: string
  updated_at: string
}

export interface CreateRoomData {
  type: 'direct' | 'group'
  user_id?: number
  title?: string
  participant_ids?: number[]
}

export type WSIncoming =
  | { type: 'message.new'; data: Message }
  | { type: 'message.read'; data: { room_id: number; user_id: number } }
  | { type: 'typing.update'; data: { room_id: number; user_id: number; is_typing: boolean } }
  | { type: 'status.online'; data: { user_id: number; is_online: boolean } }
  | { type: 'room.created'; data: ChatRoom }
  | { type: 'error'; detail: string }

export type WSOutgoing =
  | { type: 'message.send'; room_id: number; text: string; msg_type?: string; attachment_ids?: number[]; parent_id?: number }
  | { type: 'message.read'; room_id: number }
  | { type: 'typing.start'; room_id: number }
  | { type: 'typing.stop'; room_id: number }
