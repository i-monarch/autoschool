'use client'

import { useEffect, useState } from 'react'
import { Bell, BellOff, Clock, Save } from 'lucide-react'
import api from '@/lib/api'
import { useToast } from '@/components/ui/Toast'

type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

interface ReminderState {
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

const DAYS: { key: DayKey; short: string; full: string }[] = [
  { key: 'monday',    short: 'Пн', full: 'Понеділок' },
  { key: 'tuesday',   short: 'Вт', full: 'Вівторок' },
  { key: 'wednesday', short: 'Ср', full: 'Середа' },
  { key: 'thursday',  short: 'Чт', full: 'Четвер' },
  { key: 'friday',    short: 'Пт', full: 'П\'ятниця' },
  { key: 'saturday',  short: 'Сб', full: 'Субота' },
  { key: 'sunday',    short: 'Нд', full: 'Неділя' },
]

const DEFAULT_TIME = '19:00'

function trimTime(t: string | null): string | null {
  if (!t) return null
  // accept "HH:MM" or "HH:MM:SS"
  return t.slice(0, 5)
}

export default function RemindersPage() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [state, setState] = useState<ReminderState>({
    enabled: true,
    message: '',
    monday: null, tuesday: null, wednesday: null, thursday: null,
    friday: null, saturday: null, sunday: null,
  })
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission | 'unsupported'>('default')

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission)
    } else {
      setBrowserPermission('unsupported')
    }
  }, [])

  useEffect(() => {
    api.get<ReminderState>('/notifications/study-reminder/')
      .then(res => {
        setState({
          enabled: res.data.enabled,
          message: res.data.message || '',
          monday:    trimTime(res.data.monday),
          tuesday:   trimTime(res.data.tuesday),
          wednesday: trimTime(res.data.wednesday),
          thursday:  trimTime(res.data.thursday),
          friday:    trimTime(res.data.friday),
          saturday:  trimTime(res.data.saturday),
          sunday:    trimTime(res.data.sunday),
        })
      })
      .catch(() => toast.add('Не вдалося завантажити налаштування', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const toggleDay = (day: DayKey) => {
    setState(prev => ({
      ...prev,
      [day]: prev[day] === null ? DEFAULT_TIME : null,
    }))
  }

  const setDayTime = (day: DayKey, value: string) => {
    setState(prev => ({ ...prev, [day]: value || null }))
  }

  const enableAll = () => {
    setState(prev => ({
      ...prev,
      monday: prev.monday ?? DEFAULT_TIME,
      tuesday: prev.tuesday ?? DEFAULT_TIME,
      wednesday: prev.wednesday ?? DEFAULT_TIME,
      thursday: prev.thursday ?? DEFAULT_TIME,
      friday: prev.friday ?? DEFAULT_TIME,
    }))
  }

  const clearAll = () => {
    setState(prev => ({
      ...prev,
      monday: null, tuesday: null, wednesday: null, thursday: null,
      friday: null, saturday: null, sunday: null,
    }))
  }

  const requestBrowserPermission = async () => {
    if (browserPermission === 'unsupported' || !('Notification' in window)) return
    const result = await Notification.requestPermission()
    setBrowserPermission(result)
    if (result === 'granted') {
      toast.add('Дозвіл на сповіщення надано', 'success')
      try {
        new Notification('Готово!', {
          body: 'Ми нагадаємо про навчання у вибраний час.',
        })
      } catch { /* ignore */ }
    } else if (result === 'denied') {
      toast.add('Сповіщення заборонені у браузері', 'error')
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        enabled: state.enabled,
        message: state.message,
        monday: state.monday,
        tuesday: state.tuesday,
        wednesday: state.wednesday,
        thursday: state.thursday,
        friday: state.friday,
        saturday: state.saturday,
        sunday: state.sunday,
      }
      await api.patch('/notifications/study-reminder/', payload)
      toast.add('Налаштування збережено', 'success')
    } catch {
      toast.add('Не вдалося зберегти', 'error')
    } finally {
      setSaving(false)
    }
  }

  const activeDaysCount = DAYS.filter(d => state[d.key]).length

  if (loading) {
    return (
      <div>
        <div className="skeleton h-8 w-64 mb-6" />
        <div className="space-y-3">
          {[...Array(7)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50/60 to-rose-50 border border-amber-200/60 mb-8">
        <svg className="absolute right-6 top-1/2 -translate-y-1/2 w-24 h-24 text-amber-700 opacity-[0.08]" viewBox="0 0 64 64" fill="none">
          <path d="M32 6 C22 6 16 14 16 26 V36 L10 44 H54 L48 36 V26 C48 14 42 6 32 6 Z" stroke="currentColor" strokeWidth="3" fill="none" strokeLinejoin="round" />
          <path d="M26 50 C26 54 28 58 32 58 C36 58 38 54 38 50" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>

        <div className="relative px-6 py-7 sm:px-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-base-content">Нагадування про навчання</h1>
              <p className="text-base-content/55 text-sm">Оберіть дні та час — браузер нагадає вчити ПДР</p>
            </div>
          </div>
        </div>
      </div>

      {/* Browser permission status */}
      {browserPermission !== 'granted' && browserPermission !== 'unsupported' && (
        <div className="mb-6 p-4 rounded-xl border border-info/30 bg-info/5 flex items-start gap-3">
          <Bell className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">
              {browserPermission === 'denied'
                ? 'Сповіщення заблоковано браузером'
                : 'Дозвольте показувати сповіщення'}
            </p>
            <p className="text-xs text-base-content/55 mt-1">
              {browserPermission === 'denied'
                ? 'Розблокуйте у налаштуваннях сайту, щоб отримувати нагадування.'
                : 'Без дозволу нагадування не з\'являться, але налаштування збережуться.'}
            </p>
          </div>
          {browserPermission !== 'denied' && (
            <button onClick={requestBrowserPermission} className="btn btn-sm btn-info">
              Дозволити
            </button>
          )}
        </div>
      )}

      {browserPermission === 'unsupported' && (
        <div className="mb-6 p-4 rounded-xl border border-warning/30 bg-warning/5 text-sm">
          Ваш браузер не підтримує системних сповіщень. Налаштування все одно збережуться.
        </div>
      )}

      {/* Master toggle */}
      <div className="card bg-base-100 border border-base-300/60 mb-6">
        <div className="card-body p-5 flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {state.enabled
              ? <Bell className="w-5 h-5 text-primary" />
              : <BellOff className="w-5 h-5 text-base-content/40" />}
            <div>
              <p className="font-semibold text-sm">Нагадування</p>
              <p className="text-xs text-base-content/50">
                {state.enabled
                  ? `Активних днів: ${activeDaysCount}`
                  : 'Вимкнено'}
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={state.enabled}
            onChange={(e) => setState(prev => ({ ...prev, enabled: e.target.checked }))}
          />
        </div>
      </div>

      {/* Days schedule */}
      <div className={`card bg-base-100 border border-base-300/60 mb-6 transition-opacity ${!state.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="card-body p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-base-content/60" />
              Розклад нагадувань
            </h2>
            <div className="flex gap-1.5">
              <button onClick={enableAll} className="btn btn-xs btn-ghost">Робочі дні</button>
              <button onClick={clearAll} className="btn btn-xs btn-ghost">Очистити</button>
            </div>
          </div>

          <div className="space-y-2">
            {DAYS.map(day => {
              const time = state[day.key]
              const active = time !== null
              return (
                <div
                  key={day.key}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    active
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-base-300/50 bg-base-100'
                  }`}
                >
                  <button
                    onClick={() => toggleDay(day.key)}
                    className={`w-10 h-10 rounded-lg font-bold text-sm flex items-center justify-center flex-shrink-0 transition-colors ${
                      active
                        ? 'bg-primary text-primary-content'
                        : 'bg-base-200 text-base-content/50 hover:bg-base-300'
                    }`}
                  >
                    {day.short}
                  </button>
                  <span className="text-sm flex-1">{day.full}</span>
                  {active ? (
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setDayTime(day.key, e.target.value)}
                      className="input input-bordered input-sm w-32 font-mono"
                    />
                  ) : (
                    <button
                      onClick={() => toggleDay(day.key)}
                      className="text-xs text-base-content/40 hover:text-primary transition-colors"
                    >
                      Додати
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Custom message */}
      <div className={`card bg-base-100 border border-base-300/60 mb-6 transition-opacity ${!state.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="card-body p-5">
          <label className="text-sm font-semibold mb-2 block">
            Текст нагадування <span className="text-base-content/40 font-normal">(необов'язково)</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="Час вчити ПДР!"
            maxLength={255}
            value={state.message}
            onChange={(e) => setState(prev => ({ ...prev, message: e.target.value }))}
          />
          <p className="text-xs text-base-content/40 mt-2">
            Якщо не вказано, буде стандартний текст про навчання.
          </p>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end gap-3 pb-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary gap-2"
        >
          {saving
            ? <span className="loading loading-spinner loading-xs" />
            : <Save className="w-4 h-4" />}
          Зберегти
        </button>
      </div>
    </div>
  )
}
