'use client'

import { useState } from 'react'
import { User, Mail, Phone, Shield, Save, X, Video } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { useAuthStore } from '@/stores/auth'
import api from '@/lib/api'

export default function TeacherProfilePage() {
  const { user, fetchMe } = useAuthStore()
  const toast = useToast()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [meetUrl, setMeetUrl] = useState((user as any)?.default_meet_url || '')
  const [savingMeet, setSavingMeet] = useState(false)
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })

  const startEdit = () => {
    setForm({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    })
    setEditing(true)
  }

  const handleSaveMeetUrl = async () => {
    setSavingMeet(true)
    try {
      await api.patch('/teacher/profile/', { default_meet_url: meetUrl })
      await fetchMe()
      toast.add('Посилання збережено', 'success')
    } catch {
      toast.add('Помилка збереження', 'error')
    }
    setSavingMeet(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch('/teacher/profile/', form)
      await fetchMe()
      setEditing(false)
    } catch { /* ignore */ }
    setSaving(false)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Профіль</h1>
        <p className="text-base-content/60 text-sm mt-1">Ваші дані та налаштування</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-base-100 border border-base-300/60">
            <div className="card-body p-5">
              <h2 className="font-semibold flex items-center gap-2 mb-4">
                <User className="w-4.5 h-4.5 text-base-content/60" />
                Особисті дані
              </h2>

              {editing ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-base-content/50 mb-1 block">Ім&apos;я</label>
                    <input
                      className="input input-bordered input-sm w-full"
                      value={form.first_name}
                      onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-base-content/50 mb-1 block">Прізвище</label>
                    <input
                      className="input input-bordered input-sm w-full"
                      value={form.last_name}
                      onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-base-content/50 mb-1 block">Email</label>
                    <input
                      className="input input-bordered input-sm w-full"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-base-content/50 mb-1 block">Телефон</label>
                    <input
                      className="input input-bordered input-sm w-full"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-base-content/50 mb-1">Ім&apos;я</p>
                    <p className="text-sm font-medium">{user?.first_name || '---'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-base-content/50 mb-1">Прізвище</p>
                    <p className="text-sm font-medium">{user?.last_name || '---'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-base-content/50 mb-1">Email</p>
                    <p className="text-sm font-medium flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-base-content/40" />
                      {user?.email || '---'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-base-content/50 mb-1">Телефон</p>
                    <p className="text-sm font-medium flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-base-content/40" />
                      {user?.phone || 'Не вказано'}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                {editing ? (
                  <>
                    <button onClick={handleSave} disabled={saving} className="btn btn-sm btn-primary gap-1">
                      <Save className="w-3.5 h-3.5" />
                      {saving ? 'Збереження...' : 'Зберегти'}
                    </button>
                    <button onClick={() => setEditing(false)} className="btn btn-sm btn-ghost gap-1">
                      <X className="w-3.5 h-3.5" /> Скасувати
                    </button>
                  </>
                ) : (
                  <button onClick={startEdit} className="btn btn-sm btn-outline">Редагувати</button>
                )}
              </div>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300/60">
            <div className="card-body p-5">
              <h2 className="font-semibold flex items-center gap-2 mb-4">
                <Video className="w-4.5 h-4.5 text-base-content/60" />
                Онлайн-заняття
              </h2>
              <div>
                <p className="text-sm text-base-content/60 mb-2">
                  Постійне посилання на Zoom або Google Meet. Буде автоматично підставлятися при створенні нових слотів.
                </p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    className="input input-bordered input-sm flex-1"
                    placeholder="https://zoom.us/j/1234567890"
                    value={meetUrl}
                    onChange={e => setMeetUrl(e.target.value)}
                  />
                  <button
                    onClick={handleSaveMeetUrl}
                    disabled={savingMeet}
                    className="btn btn-sm btn-primary gap-1"
                  >
                    {savingMeet ? <span className="loading loading-spinner loading-xs" /> : <Save className="w-3.5 h-3.5" />}
                    Зберегти
                  </button>
                </div>
                {meetUrl && (
                  <p className="text-xs text-success mt-2">Посилання встановлено. Нові слоти будуть створюватися з цим посиланням.</p>
                )}
              </div>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300/60">
            <div className="card-body p-5">
              <h2 className="font-semibold flex items-center gap-2 mb-4">
                <Shield className="w-4.5 h-4.5 text-base-content/60" />
                Безпека
              </h2>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">Пароль</p>
                  <p className="text-xs text-base-content/50">Змінити пароль входу</p>
                </div>
                <button className="btn btn-sm btn-ghost">Змінити</button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card bg-base-100 border border-base-300/60">
            <div className="card-body p-5 items-center text-center">
              <div className="avatar placeholder mb-3">
                <div className="bg-secondary text-secondary-content rounded-full w-20">
                  <span className="text-2xl font-medium">
                    {user?.first_name?.[0] || user?.username[0]}
                  </span>
                </div>
              </div>
              <p className="font-semibold">
                {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username}
              </p>
              <span className="badge badge-secondary badge-sm mt-1">Викладач</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
