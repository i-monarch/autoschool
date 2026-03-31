'use client'

import { useEffect, useState } from 'react'
import { useChatStore } from '@/stores/chat'
import { useWebSocket } from '@/hooks/useWebSocket'
import ChatSidebar from './ChatSidebar'
import ChatWindow from './ChatWindow'
import ChatEmptyState from './ChatEmptyState'
import CreateChatModal from './CreateChatModal'
import GroupInfoPanel from './GroupInfoPanel'

export default function ChatLayout() {
  const { activeRoomId, fetchRooms, setActiveRoom } = useChatStore()
  const { send } = useWebSocket()
  const [showNewChat, setShowNewChat] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [mobileView, setMobileView] = useState<'sidebar' | 'chat'>('sidebar')

  useEffect(() => {
    fetchRooms()
    return () => setActiveRoom(null)
  }, [fetchRooms, setActiveRoom])

  useEffect(() => {
    if (activeRoomId) {
      setMobileView('chat')
    }
  }, [activeRoomId])

  const handleBack = () => {
    setMobileView('sidebar')
    setActiveRoom(null)
  }

  return (
    <div className="h-[calc(100vh-10rem)] lg:h-[calc(100vh-7rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Повідомлення</h1>
        <p className="text-base-content/60 text-sm mt-1">Чат з викладачами та учнями</p>
      </div>

      <div className="flex-1 flex rounded-xl border border-base-300/60 bg-base-100 overflow-hidden">
        {/* Sidebar - hidden on mobile when chat is open */}
        <div className={`
          ${mobileView === 'chat' ? 'hidden' : 'flex'}
          md:flex flex-col w-full md:w-72 lg:w-80 border-r border-base-300/60
        `}>
          <ChatSidebar onNewChat={() => setShowNewChat(true)} />
        </div>

        {/* Chat area */}
        <div className={`
          ${mobileView === 'sidebar' ? 'hidden' : 'flex'}
          md:flex flex-col flex-1
        `}>
          {activeRoomId ? (
            <ChatWindow
              send={send}
              onBack={handleBack}
              onInfo={() => setShowInfo(!showInfo)}
            />
          ) : (
            <ChatEmptyState />
          )}
        </div>

        {/* Group info panel - desktop only */}
        {showInfo && activeRoomId && (
          <div className="hidden lg:block">
            <GroupInfoPanel open={showInfo} onClose={() => setShowInfo(false)} />
          </div>
        )}
      </div>

      <CreateChatModal open={showNewChat} onClose={() => setShowNewChat(false)} />
    </div>
  )
}
