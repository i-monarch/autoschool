'use client'

import { Users, Calendar, MessageCircle, Clock, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import Link from 'next/link'

export default function TeacherDashboardPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">
          Привіт, {user?.first_name || user?.username}
        </h1>
        <p className="text-base-content/60">Панель викладача</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatCard icon={<Users className="w-5 h-5" />} label="Активні учні" value="0" color="secondary" />
        <StatCard icon={<Calendar className="w-5 h-5" />} label="Занять сьогодні" value="0" color="info" />
        <StatCard icon={<MessageCircle className="w-5 h-5" />} label="Нових повідомлень" value="0" color="primary" />
        <StatCard icon={<Clock className="w-5 h-5" />} label="Годин цього тижня" value="0" color="accent" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Розклад на сьогодні</h2>
            <Link href="/teacher/schedule" className="text-sm text-secondary hover:underline flex items-center gap-1">
              Весь розклад
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="card bg-base-100 border border-base-300/60">
            <div className="card-body items-center text-center py-10">
              <Calendar className="w-10 h-10 text-base-content/20 mb-2" />
              <p className="text-sm text-base-content/50">Немає запланованих занять</p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Останні повідомлення</h2>
            <Link href="/teacher/chat" className="text-sm text-secondary hover:underline flex items-center gap-1">
              Всі чати
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="card bg-base-100 border border-base-300/60">
            <div className="card-body items-center text-center py-10">
              <MessageCircle className="w-10 h-10 text-base-content/20 mb-2" />
              <p className="text-sm text-base-content/50">Немає нових повідомлень</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="card bg-base-100 border border-base-300/60 p-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-${color}/10 text-${color}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs sm:text-sm text-base-content/50 mt-0.5">{label}</p>
    </div>
  )
}
