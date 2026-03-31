'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useChatStore } from '@/stores/chat'
import type { WSIncoming, WSOutgoing } from '@/types/chat'

const WS_URL = (process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000') + '/ws/chat/'
const RECONNECT_MAX = 30000
const HEARTBEAT_INTERVAL = 30000

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>()
  const heartbeatTimer = useRef<ReturnType<typeof setInterval>>()
  const reconnectDelay = useRef(1000)
  const mountedRef = useRef(true)

  const store = useChatStore

  const connect = useCallback(() => {
    if (!mountedRef.current) return

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      reconnectDelay.current = 1000
      heartbeatTimer.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }))
        }
      }, HEARTBEAT_INTERVAL)
    }

    ws.onmessage = (event) => {
      try {
        const data: WSIncoming = JSON.parse(event.data)
        handleMessage(data)
      } catch {
        // ignore malformed messages
      }
    }

    ws.onclose = () => {
      clearInterval(heartbeatTimer.current)
      if (mountedRef.current) {
        reconnectTimer.current = setTimeout(() => {
          reconnectDelay.current = Math.min(reconnectDelay.current * 2, RECONNECT_MAX)
          connect()
        }, reconnectDelay.current)
      }
    }

    ws.onerror = () => {
      ws.close()
    }
  }, [])

  const handleMessage = (msg: WSIncoming) => {
    const state = store.getState()

    switch (msg.type) {
      case 'message.new':
        state.addIncomingMessage(msg.data)
        state.updateRoomOnMessage(msg.data)
        break
      case 'message.read':
        // could update read receipts UI
        break
      case 'typing.update':
        state.setTyping(msg.data.room_id, msg.data.user_id, msg.data.is_typing)
        break
      case 'status.online':
        state.setOnline(msg.data.user_id, msg.data.is_online)
        break
      case 'room.created':
        state.addRoom(msg.data)
        break
    }
  }

  const send = useCallback((data: WSOutgoing) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    connect()

    return () => {
      mountedRef.current = false
      clearTimeout(reconnectTimer.current)
      clearInterval(heartbeatTimer.current)
      wsRef.current?.close()
    }
  }, [connect])

  return { send }
}
