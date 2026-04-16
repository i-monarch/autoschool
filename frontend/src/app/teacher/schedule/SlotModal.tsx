'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import api from '@/lib/api'
import { useToast } from '@/components/ui/Toast'

interface SlotData {
  id: number
  date: string
  start_time: string
  end_time: string
  lesson_type: string
  title: string
  description: string
  meet_url: string
  max_students: number
}

interface SlotModalProps {
  slot: SlotData | null
  defaultDate?: string
  onClose: () => void
  onSaved: () => void
}

export default function SlotModal({ slot, defaultDate, onClose, onSaved }: SlotModalProps) {
  const toast = useToast()
  const isEdit = !!slot

  const [date, setDate] = useState(defaultDate || '')
  const [startTime, setStartTime] = useState('10:00')
  const [endTime, setEndTime] = useState('11:00')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [meetUrl, setMeetUrl] = useState('')
  const [limitEnabled, setLimitEnabled] = useState(false)
  const [maxStudents, setMaxStudents] = useState(10)
  const [repeatWeeks, setRepeatWeeks] = useState(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (slot) {
      setDate(slot.date)
      setStartTime(slot.start_time.slice(0, 5))
      setEndTime(slot.end_time.slice(0, 5))
      setTitle(slot.title)
      setDescription(slot.description)
      setMeetUrl(slot.meet_url)
      setLimitEnabled(slot.max_students > 0)
      setMaxStudents(slot.max_students || 10)
    }
  }, [slot])

  const handleSave = async () => {
    if (!date || !startTime || !endTime) {
      toast.add('Заповніть дату та час', 'error')
      return
    }

    setSaving(true)
    try {
      const payload: Record<string, any> = {
        date,
        start_time: startTime,
        end_time: endTime,
        lesson_type: 'online',
        title,
        description,
        meet_url: meetUrl,
        max_students: limitEnabled ? maxStudents : 0,
      }
      if (!isEdit && repeatWeeks > 0) {
        payload.repeat_weeks = repeatWeeks
      }
      if (isEdit) {
        await api.put(`/teacher/schedule/slots/${slot.id}/`, payload)
        toast.add('Слот оновлено', 'success')
      } else {
        const msg = repeatWeeks > 0
          ? `Створено ${repeatWeeks + 1} слотів`
          : 'Слот створено'
        await api.post('/teacher/schedule/slots/', payload)
        toast.add(msg, 'success')
      }
      onSaved()
    } catch (err: any) {
      const data = err.response?.data
      const msg = typeof data === 'string'
        ? data
        : data?.non_field_errors?.[0] || data?.end_time?.[0] || data?.detail || 'Помилка збереження'
      toast.add(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">
            {isEdit ? 'Редагувати слот' : 'Новий слот'}
          </h3>
          <button className="btn btn-ghost btn-sm btn-square" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label"><span className="label-text">Дата</span></label>
            <input
              type="date"
              className="input input-bordered w-full"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label"><span className="label-text">Початок</span></label>
              <input
                type="time"
                className="input input-bordered w-full"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className="label"><span className="label-text">Кінець</span></label>
              <input
                type="time"
                className="input input-bordered w-full"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label"><span className="label-text">Назва (необов'язково)</span></label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Наприклад: Консультація перед іспитом"
            />
          </div>

          <div>
            <label className="label"><span className="label-text">Опис (необов'язково)</span></label>
            <textarea
              className="textarea textarea-bordered w-full"
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Посилання на Zoom / Google Meet</span>
              {!isEdit && !meetUrl && <span className="label-text-alt text-success">з профілю</span>}
            </label>
            <input
              type="url"
              className="input input-bordered w-full"
              value={meetUrl}
              onChange={e => setMeetUrl(e.target.value)}
              placeholder="https://meet.google.com/..."
            />
          </div>

          <div className="flex items-center gap-3 py-1">
            <input
              type="checkbox"
              className="toggle toggle-primary toggle-sm"
              checked={limitEnabled}
              onChange={e => setLimitEnabled(e.target.checked)}
            />
            <span className="text-sm">Обмежити кількість учнів</span>
            {limitEnabled && (
              <input
                type="number"
                className="input input-bordered input-sm w-20"
                min={1}
                max={200}
                value={maxStudents}
                onChange={e => setMaxStudents(parseInt(e.target.value) || 1)}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {!isEdit && (
              <div>
                <label className="label"><span className="label-text">Повторювати (тижнів)</span></label>
                <select
                  className="select select-bordered w-full"
                  value={repeatWeeks}
                  onChange={e => setRepeatWeeks(parseInt(e.target.value))}
                >
                  <option value={0}>Не повторювати</option>
                  <option value={2}>2 тижні</option>
                  <option value={4}>4 тижні</option>
                  <option value={8}>8 тижнів</option>
                  <option value={12}>12 тижнів</option>
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>Скасувати</button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving && <span className="loading loading-spinner loading-xs" />}
            {isEdit ? 'Зберегти' : 'Створити'}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  )
}
