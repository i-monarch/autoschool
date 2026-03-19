'use client'

import { User, Mail, Phone, Shield, Monitor, LogOut } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Профіль</h1>
        <p className="text-base-content/60 text-sm mt-1">Ваші дані та налаштування</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal data */}
          <div className="card bg-base-100 border border-base-300/60">
            <div className="card-body p-5">
              <h2 className="font-semibold flex items-center gap-2 mb-4">
                <User className="w-4.5 h-4.5 text-base-content/60" />
                Особисті дані
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <InfoField label="Ім'я" value={user?.first_name || '---'} />
                <InfoField label="Прізвище" value={user?.last_name || '---'} />
                <InfoField
                  label="Email"
                  value={user?.email || '---'}
                  icon={<Mail className="w-3.5 h-3.5" />}
                />
                <InfoField
                  label="Телефон"
                  value={user?.phone || 'Не вказано'}
                  icon={<Phone className="w-3.5 h-3.5" />}
                />
              </div>
              <div className="mt-4">
                <button className="btn btn-sm btn-outline">Редагувати</button>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="card bg-base-100 border border-base-300/60">
            <div className="card-body p-5">
              <h2 className="font-semibold flex items-center gap-2 mb-4">
                <Shield className="w-4.5 h-4.5 text-base-content/60" />
                Безпека
              </h2>
              <div className="flex items-center justify-between py-3 border-b border-base-200">
                <div>
                  <p className="text-sm font-medium">Пароль</p>
                  <p className="text-xs text-base-content/50">Останній раз змінено: невідомо</p>
                </div>
                <button className="btn btn-sm btn-ghost">Змінити</button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">Двофакторна аутентифікація</p>
                  <p className="text-xs text-base-content/50">Додатковий захист вашого акаунту</p>
                </div>
                <span className="badge badge-ghost badge-sm">Скоро</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Avatar card */}
          <div className="card bg-base-100 border border-base-300/60">
            <div className="card-body p-5 items-center text-center">
              <div className="avatar placeholder mb-3">
                <div className="bg-neutral text-neutral-content rounded-full w-20">
                  <span className="text-2xl font-medium">
                    {user?.first_name?.[0] || user?.username[0]}
                  </span>
                </div>
              </div>
              <p className="font-semibold">
                {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username}
              </p>
              <span className="badge badge-primary badge-sm mt-1">Учень</span>
              <button className="btn btn-sm btn-ghost mt-3 text-xs">Змінити фото</button>
            </div>
          </div>

          {/* Devices */}
          <div className="card bg-base-100 border border-base-300/60">
            <div className="card-body p-5">
              <h2 className="font-semibold flex items-center gap-2 mb-3">
                <Monitor className="w-4.5 h-4.5 text-base-content/60" />
                Пристрої
              </h2>
              <p className="text-sm text-base-content/50">
                Максимум 2 пристрої одночасно
              </p>
              <div className="mt-3 text-xs text-base-content/40">
                Немає активних пристроїв
              </div>
            </div>
          </div>

          {/* Danger zone */}
          <div className="card bg-base-100 border border-error/20">
            <div className="card-body p-5">
              <h2 className="font-semibold text-error text-sm mb-2">Небезпечна зона</h2>
              <button className="btn btn-sm btn-outline btn-error w-full gap-2">
                <LogOut className="w-4 h-4" />
                Вийти з усіх пристроїв
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoField({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div>
      <p className="text-xs text-base-content/50 mb-1">{label}</p>
      <p className="text-sm font-medium flex items-center gap-1.5">
        {icon && <span className="text-base-content/40">{icon}</span>}
        {value}
      </p>
    </div>
  )
}
