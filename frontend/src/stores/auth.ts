'use client'

import { create } from 'zustand'
import api from '@/lib/api'
import type { User, LoginData, RegisterData } from '@/types/auth'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  login: (data: LoginData) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,

  login: async (data) => {
    set({ loading: true, error: null })
    try {
      const res = await api.post('/auth/login/', data)
      set({ user: res.data, loading: false })
    } catch (err: unknown) {
      const message = extractError(err)
      set({ error: message, loading: false })
      throw err
    }
  },

  register: async (data) => {
    set({ loading: true, error: null })
    try {
      const res = await api.post('/auth/register/', data)
      set({ user: res.data, loading: false })
    } catch (err: unknown) {
      const message = extractError(err)
      set({ error: message, loading: false })
      throw err
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout/')
    } catch {
      // ignore
    }
    set({ user: null })
  },

  fetchMe: async () => {
    set({ loading: true })
    try {
      const res = await api.get('/users/me/')
      set({ user: res.data, loading: false })
    } catch {
      set({ user: null, loading: false })
    }
  },

  clearError: () => set({ error: null }),
}))

function extractError(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response
    return response?.data?.message || 'Unexpected error'
  }
  return 'Network error'
}
