'use client'

import { User, Mail, Phone, Shield } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'

export default function TeacherProfilePage() {
  const user = useAuthStore((s) => s.user)

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
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-base-content/50 mb-1">Ім'я</p>
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
              <div className="mt-4">
                <button className="btn btn-sm btn-outline">Редагувати</button>
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
              <button className="btn btn-sm btn-ghost mt-3 text-xs">Змінити фото</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
