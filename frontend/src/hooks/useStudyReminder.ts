'use client'

import { useEffect } from 'react'
import api from '@/lib/api'

interface ReminderSettings {
  enabled: boolean
  message: string
  monday: string | null
  tuesday: string | null
  wednesday: string | null
  thursday: string | null
  friday: string | null
  saturday: string | null
  sunday: string | null
}

const DAY_KEYS: (keyof ReminderSettings)[] = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
]

const STORAGE_PREFIX = 'study_reminder_fired_'
const CHECK_INTERVAL_MS = 60_000

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function parseTime(value: string | null): { hours: number; minutes: number } | null {
  if (!value) return null
  const [h, m] = value.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return { hours: h, minutes: m }
}

function shouldFire(target: { hours: number; minutes: number }): boolean {
  const now = new Date()
  const targetMinutes = target.hours * 60 + target.minutes
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  // fire if current minute matches or we're within 5 min after (catches missed ticks)
  return nowMinutes >= targetMinutes && nowMinutes <= targetMinutes + 5
}

function alreadyFired(dayKey: string): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(`${STORAGE_PREFIX}${dayKey}_${todayKey()}`) === '1'
}

function markFired(dayKey: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(`${STORAGE_PREFIX}${dayKey}_${todayKey()}`, '1')
}

function showNotification(message: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  try {
    new Notification('AutoSchool — час навчання', {
      body: message || 'Час повчити ПДР! Декілька питань — і ви ближче до прав.',
      icon: '/favicon.ico',
      tag: 'study-reminder',
    })
  } catch {
    // ignore
  }
}

export function useStudyReminder(role: string | undefined) {
  useEffect(() => {
    if (role !== 'student') return
    if (typeof window === 'undefined' || !('Notification' in window)) return

    let settings: ReminderSettings | null = null
    let cancelled = false

    api.get<ReminderSettings>('/notifications/study-reminder/')
      .then(res => { if (!cancelled) settings = res.data })
      .catch(() => {})

    const tick = () => {
      if (!settings || !settings.enabled) return
      if (Notification.permission !== 'granted') return

      const dayKey = DAY_KEYS[new Date().getDay()] as keyof ReminderSettings
      const value = settings[dayKey] as string | null
      const parsed = parseTime(value)
      if (!parsed) return
      if (!shouldFire(parsed)) return
      if (alreadyFired(dayKey)) return

      showNotification(settings.message)
      markFired(dayKey)
    }

    const interval = setInterval(tick, CHECK_INTERVAL_MS)
    // first run shortly after mount, after settings probably loaded
    const initial = setTimeout(tick, 3000)

    return () => {
      cancelled = true
      clearInterval(interval)
      clearTimeout(initial)
    }
  }, [role])
}
