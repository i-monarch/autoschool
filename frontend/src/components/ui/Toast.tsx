'use client'

import { useEffect } from 'react'
import { create } from 'zustand'

interface ToastItem {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastState {
  toasts: ToastItem[]
  add: (message: string, type: ToastItem['type']) => void
  remove: (id: number) => void
}

let nextId = 0

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  add: (message, type) => {
    const id = ++nextId
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
  },
  remove: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
  },
}))

function ToastItem({ toast }: { toast: ToastItem }) {
  const remove = useToast((s) => s.remove)

  useEffect(() => {
    if (toast.type !== 'error') {
      const timer = setTimeout(() => remove(toast.id), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast.id, toast.type, remove])

  const alertClass = {
    success: 'alert-success',
    error: 'alert-error',
    info: 'alert-info',
  }

  return (
    <div className={`alert ${alertClass[toast.type]} shadow-lg`}>
      <span>{toast.message}</span>
      <button
        className="btn btn-ghost btn-xs"
        onClick={() => remove(toast.id)}
        aria-label="Close"
      >
        x
      </button>
    </div>
  )
}

export default function ToastContainer() {
  const toasts = useToast((s) => s.toasts)

  if (!toasts.length) return null

  return (
    <div className="toast toast-top toast-end z-50">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  )
}
