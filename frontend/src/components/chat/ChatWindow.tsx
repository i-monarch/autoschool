'use client'

import { useState } from 'react'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { chatApi } from '@/lib/chat-api'
import ChatHeader from './ChatHeader'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import TypingIndicator from './TypingIndicator'
import ImageLightbox from './ImageLightbox'
import type { Message, WSOutgoing } from '@/types/chat'

interface Props {
  send: (data: WSOutgoing) => void
  onBack: () => void
  onInfo?: () => void
}

export default function ChatWindow({ send, onBack, onInfo }: Props) {
  const { activeRoomId, rooms, typingUsers, markRoomRead, editMessage, deleteMessage } = useChatStore()
  const user = useAuthStore((s) => s.user)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [replyTo, setReplyTo] = useState<Message | null>(null)

  if (!activeRoomId) return null

  const room = rooms.find((r) => r.id === activeRoomId)
  const isParticipant = room?.participants.some((p) => p.user.id === user?.id) ?? false
  const typing = (typingUsers[activeRoomId] || []).filter((id) => id !== user?.id)

  const handleEdit = async (msgId: number, newText: string) => {
    try {
      await chatApi.editMessage(activeRoomId, msgId, newText)
      editMessage(msgId, newText)
    } catch { /* error */ }
  }

  const handleDelete = async (msg: Message) => {
    try {
      await chatApi.deleteMessage(activeRoomId, msg.id)
      deleteMessage(msg.id)
    } catch { /* error */ }
  }

  const handleMarkRead = () => {
    markRoomRead(activeRoomId)
    chatApi.markAsRead(activeRoomId)
    send({ type: 'message.read', room_id: activeRoomId })
  }

  return (
    <div className="flex-1 flex flex-col h-full" onClick={handleMarkRead}>
      <ChatHeader onBack={onBack} onInfo={onInfo} />

      <MessageList
        onImageClick={setLightboxUrl}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <TypingIndicator visible={typing.length > 0} />

      {isParticipant ? (
        <MessageInput
          roomId={activeRoomId}
          send={send}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
        />
      ) : (
        <div className="px-4 py-3 border-t border-base-300/40 text-center">
          <p className="text-xs text-base-content/40">Режим перегляду</p>
        </div>
      )}

      <ImageLightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
    </div>
  )
}
