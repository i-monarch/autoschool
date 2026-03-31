'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import MessageBubble from './MessageBubble'
import type { Message } from '@/types/chat'

interface Props {
  onImageClick: (url: string) => void
  onEdit: (msgId: number, newText: string) => void
  onDelete: (msg: Message) => void
  onVisible?: () => void
}

function isSameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString()
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) return 'Сьогодні'
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return 'Вчора'
  return d.toLocaleDateString('uk', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function MessageList({ onImageClick, onEdit, onDelete, onVisible }: Props) {
  const { messages, messagesLoading, hasMore, loadMoreMessages, activeRoomId } = useChatStore()
  const user = useAuthStore((s) => s.user)
  const listRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const wasAtBottom = useRef(true)
  const prevMsgCount = useRef(0)
  const prevScrollHeight = useRef(0)
  const loadingUp = useRef(false)

  const checkAtBottom = useCallback(() => {
    const el = listRef.current
    if (!el) return
    wasAtBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60
  }, [])

  useEffect(() => {
    if (loadingUp.current && listRef.current) {
      const newScrollHeight = listRef.current.scrollHeight
      listRef.current.scrollTop = newScrollHeight - prevScrollHeight.current
      loadingUp.current = false
    } else if (wasAtBottom.current || messages.length !== prevMsgCount.current) {
      const isNewMsg = messages.length > prevMsgCount.current && prevMsgCount.current > 0
      if (wasAtBottom.current || !isNewMsg) {
        bottomRef.current?.scrollIntoView({ behavior: isNewMsg ? 'smooth' : 'instant' })
      }
    }
    prevMsgCount.current = messages.length
  }, [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'instant' })
    prevMsgCount.current = messages.length
    loadingUp.current = false
  }, [activeRoomId])

  // Mark as read when bottom of messages is visible
  useEffect(() => {
    const el = bottomRef.current
    if (!el || !onVisible) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && messages.length > 0) {
          onVisible()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [onVisible, messages.length])

  const handleScroll = useCallback(() => {
    checkAtBottom()
    const el = listRef.current
    if (!el || messagesLoading || !hasMore) return
    if (el.scrollTop < 100) {
      prevScrollHeight.current = el.scrollHeight
      loadingUp.current = true
      loadMoreMessages()
    }
  }, [checkAtBottom, messagesLoading, hasMore, loadMoreMessages])

  const roomType = useChatStore((s) => s.rooms.find((r) => r.id === s.activeRoomId)?.type)
  const isGroup = roomType === 'group'

  return (
    <div
      ref={listRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto py-2"
    >
      {messagesLoading && hasMore && (
        <div className="flex justify-center py-2">
          <span className="loading loading-spinner loading-xs" />
        </div>
      )}

      {messages.map((msg, i) => {
        const showDate = i === 0 || !isSameDay(messages[i - 1].created_at, msg.created_at)
        const isOwn = msg.sender?.id === user?.id
        const prevMsg = i > 0 ? messages[i - 1] : null
        const nextMsg = i < messages.length - 1 ? messages[i + 1] : null
        const sameSenderAsPrev = !showDate && prevMsg?.sender?.id === msg.sender?.id
          && prevMsg?.type !== 'system' && !prevMsg?.is_deleted
        const sameSenderAsNext = nextMsg && isSameDay(msg.created_at, nextMsg.created_at)
          && nextMsg.sender?.id === msg.sender?.id
          && nextMsg.type !== 'system' && !nextMsg.is_deleted
        const showSender = isGroup && !isOwn && !sameSenderAsPrev

        const groupPosition = !sameSenderAsPrev && !sameSenderAsNext
          ? 'single'
          : !sameSenderAsPrev
            ? 'first'
            : !sameSenderAsNext
              ? 'last'
              : 'middle'

        return (
          <div key={msg.id}>
            {showDate && (
              <div className="text-center py-2">
                <span className="text-xs text-base-content/40 bg-base-200/60 px-3 py-0.5 rounded-full">
                  {formatDate(msg.created_at)}
                </span>
              </div>
            )}
            <MessageBubble
              message={msg}
              isOwn={isOwn}
              showSender={showSender}
              groupPosition={groupPosition}
              onImageClick={onImageClick}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        )
      })}

      <div ref={bottomRef} />
    </div>
  )
}
