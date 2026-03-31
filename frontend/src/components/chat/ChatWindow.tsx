'use client'

import { useState, useRef, useCallback } from 'react'
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
  const { activeRoomId, rooms, typingUsers, markRoomRead, editMessage, deleteMessage, isConnected } = useChatStore()
  const user = useAuthStore((s) => s.user)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const markedRef = useRef<number | null>(null)

  if (!activeRoomId) return null

  const room = rooms.find((r) => r.id === activeRoomId)
  const isParticipant = room?.participants.some((p) => p.user.id === user?.id) ?? false
  const isStaff = user?.role === 'admin' || user?.role === 'teacher'
  const canWrite = isParticipant && (room?.write_access === 'all' || isStaff)
  const typing = (typingUsers[activeRoomId] || []).filter((id) => id !== user?.id)

  const handleEdit = async (msgId: number, newText: string) => {
    try {
      await chatApi.editMessage(activeRoomId, msgId, newText)
      editMessage(msgId, newText)
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (msg: Message) => {
    try {
      await chatApi.deleteMessage(activeRoomId, msg.id)
      deleteMessage(msg.id)
    } catch (e) {
      console.error(e)
    }
  }

  const handleMarkRead = useCallback(() => {
    if ((!isParticipant && !isStaff) || !activeRoomId) return
    if (markedRef.current === activeRoomId) return
    markedRef.current = activeRoomId
    markRoomRead(activeRoomId)
    chatApi.markAsRead(activeRoomId)
    send({ type: 'message.read', room_id: activeRoomId })
  }, [activeRoomId, isParticipant, markRoomRead, send])

  return (
    <div className="flex-1 flex flex-col h-full">
      <ChatHeader onBack={onBack} onInfo={onInfo} />

      {!isConnected && (
        <div className="bg-warning/10 text-warning text-center text-sm py-1">
          Немає з'єднання. Перепідключення...
        </div>
      )}

      <MessageList
        onImageClick={setLightboxUrl}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onVisible={handleMarkRead}
      />

      <TypingIndicator visible={typing.length > 0} />

      {canWrite ? (
        <MessageInput
          roomId={activeRoomId}
          send={send}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
        />
      ) : (
        <div className="px-4 py-3 border-t border-base-300/40 text-center">
          <p className="text-xs text-base-content/40">
            {!isParticipant ? 'Режим перегляду' : 'Тільки адміни та викладачі можуть писати'}
          </p>
        </div>
      )}

      <ImageLightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
    </div>
  )
}
