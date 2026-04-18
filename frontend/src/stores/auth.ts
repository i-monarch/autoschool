'use client'

import { create } from 'zustand'
import api from '@/lib/api'
import type { User, LoginData, RegisterData } from '@/types/auth'

interface AuthState {
  user: User | null
  loading: boolean
  checked: boolean // true after fetchMe completed (regardless of result)
  error: string | null
  login: (data: LoginData) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
  refreshMe: () => Promise<void>
  setUser: (user: User) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  checked: false,
  error: null,

  login: async (data) => {
    set({ loading: true, error: null })
    try {
      const res = await api.post('/auth/login/', data)
      set({ user: res.data, loading: false, checked: true })
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
      set({ user: res.data, loading: false, checked: true })
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
    set({ user: null, checked: true })
  },

  fetchMe: async () => {
    if (useAuthStore.getState().user) return
    set({ loading: true })
    try {
      const res = await api.get('/users/me/')
      set({ user: res.data, loading: false, checked: true })
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 401 || status === 403) {
        // Auth failed — user not logged in
        set({ user: null, loading: false, checked: true })
      } else {
        // Server error (502, 500, network) — don't logout user
        set({ loading: false })
      }
    }
  },

  refreshMe: async () => {
    try {
      const res = await api.get('/users/me/')
      set({ user: res.data })
    } catch {
      // ignore
    }
  },

  setUser: (user) => set({ user }),

  clearError: () => set({ error: null }),
}))

function extractError(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const axiosErr = err as { response?: { data?: { message?: string; detail?: string }; status?: number } }
    const data = axiosErr.response?.data
    const status = axiosErr.response?.status

    if (data?.message) return data.message
    if (data?.detail) return data.detail
    if (status === 401) return 'Невірний логін або пароль'
    if (status === 400) return 'Перевірте введені дані'
    if (status === 429) return 'Забагато спроб. Спробуйте пізніше'
    if (status && status >= 500) return 'Помилка сервера. Спробуйте пізніше'
    return 'Щось пішло не так'
  }
  return 'Немає з\'єднання з сервером'
}
