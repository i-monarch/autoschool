'use client'

import { BookOpen, ClipboardCheck, Calendar, Trophy } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">
        Привіт, {user?.first_name || user?.username}!
      </h1>
      <p className="text-base-content/60 mb-8">
        Ваш прогрес навчання
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<BookOpen className="w-5 h-5" />}
          label="Пройдено уроків"
          value="0"
          color="bg-primary/10 text-primary"
        />
        <StatCard
          icon={<ClipboardCheck className="w-5 h-5" />}
          label="Тести здано"
          value="0"
          color="bg-success/10 text-success"
        />
        <StatCard
          icon={<Calendar className="w-5 h-5" />}
          label="Заняття заплановано"
          value="0"
          color="bg-info/10 text-info"
        />
        <StatCard
          icon={<Trophy className="w-5 h-5" />}
          label="Загальний прогрес"
          value="0%"
          color="bg-warning/10 text-warning"
        />
      </div>

      {/* Empty state */}
      <div className="card bg-base-200/50 p-8 text-center">
        <BookOpen className="w-12 h-12 mx-auto text-base-content/30 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Почніть навчання</h3>
        <p className="text-base-content/60 max-w-md mx-auto">
          Оберіть курс та пройдіть перший урок. Після уроку вам буде
          доступний тест для закріплення знань.
        </p>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}) {
  return (
    <div className="card bg-base-100 border border-base-200 p-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-base-content/60">{label}</p>
    </div>
  )
}
