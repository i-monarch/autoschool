'use client'

import { useEffect, useCallback } from 'react'
import { useChatStore } from '@/stores/chat'
import type { WSIncoming, WSOutgoing } from '@/types/chat'

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws'
const WS_URL = WS_BASE + '/chat/'
const RECONNECT_MAX = 30000
const HEARTBEAT_INTERVAL = 30000

let ws: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | undefined
let heartbeatTimer: ReturnType<typeof setInterval> | undefined
let reconnectDelay = 1000
let refCount = 0

function handleMessage(msg: WSIncoming) {
  const state = useChatStore.getState()
  switch (msg.type) {
    case 'message.new':
      state.addIncomingMessage(msg.data)
      state.updateRoomOnMessage(msg.data)
      break
    case 'message.read':
      break
    case 'message.edited':
      state.editMessage(msg.data.message_id, msg.data.text)
      break
    case 'message.deleted':
      state.deleteMessage(msg.data.message_id)
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
    case 'error':
      console.warn('[WS Error]', msg.detail)
      break
    case 'pong':
      break
  }
}

function connect() {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return

  ws = new WebSocket(WS_URL)

  ws.onopen = () => {
    reconnectDelay = 1000
    useChatStore.getState().setConnected(true)
    heartbeatTimer = setInterval(() => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, HEARTBEAT_INTERVAL)
  }

  ws.onmessage = (event) => {
    try {
      handleMessage(JSON.parse(event.data))
    } catch { /* ignore */ }
  }

  ws.onclose = () => {
    clearInterval(heartbeatTimer)
    useChatStore.getState().setConnected(false)
    ws = null
    if (refCount > 0) {
      reconnectTimer = setTimeout(() => {
        reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_MAX)
        connect()
      }, reconnectDelay)
    }
  }

  ws.onerror = () => {
    ws?.close()
  }
}

function disconnect() {
  clearTimeout(reconnectTimer)
  clearInterval(heartbeatTimer)
  ws?.close()
  ws = null
  reconnectDelay = 1000
}

export function wsSend(data: WSOutgoing) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data))
  }
}

export function useWebSocket() {
  useEffect(() => {
    refCount++
    if (refCount === 1) {
      connect()
    }
    return () => {
      refCount--
      if (refCount <= 0) {
        refCount = 0
        disconnect()
      }
    }
  }, [])

  const send = useCallback((data: WSOutgoing) => {
    wsSend(data)
  }, [])

  return { send }
}
