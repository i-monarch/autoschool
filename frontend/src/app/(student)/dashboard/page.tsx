'use client'

import { BookOpen, ClipboardCheck, Calendar, Trophy, ArrowRight, Play } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import Link from 'next/link'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div>
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">
          Привіт, {user?.first_name || user?.username}
        </h1>
        <p className="text-base-content/60">
          Ось ваш прогрес навчання
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatCard
          icon={<BookOpen className="w-5 h-5" />}
          label="Пройдено уроків"
          value="0 / 0"
          color="primary"
        />
        <StatCard
          icon={<ClipboardCheck className="w-5 h-5" />}
          label="Тести здано"
          value="0 / 0"
          color="success"
        />
        <StatCard
          icon={<Calendar className="w-5 h-5" />}
          label="Найближче заняття"
          value="Немає"
          color="info"
        />
        <StatCard
          icon={<Trophy className="w-5 h-5" />}
          label="Загальний прогрес"
          value="0%"
          color="warning"
          progress={0}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Continue learning */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Продовжити навчання</h2>
            <Link href="/courses" className="text-sm text-primary hover:underline flex items-center gap-1">
              Всі курси
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="card bg-base-100 border border-base-300/60">
            <div className="card-body items-center text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                <Play className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Почніть перший урок</h3>
              <p className="text-base-content/60 max-w-sm mb-4">
                Оберіть курс та пройдіть перший урок. Відеоуроки, тести
                та практичні заняття допоможуть вам підготуватися до іспиту.
              </p>
              <Link href="/courses" className="btn btn-primary btn-sm">
                Переглянути курси
              </Link>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Швидкі дії</h2>
          <div className="space-y-2">
            <QuickAction
              href="/tests"
              icon={<ClipboardCheck className="w-5 h-5" />}
              label="Пройти тест ПДР"
              sublabel="Перевірте свої знання"
            />
            <QuickAction
              href="/schedule"
              icon={<Calendar className="w-5 h-5" />}
              label="Записатися на заняття"
              sublabel="Обрати зручний час"
            />
            <QuickAction
              href="/chat"
              icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>}
              label="Написати викладачу"
              sublabel="Задати питання"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  color,
  progress,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
  progress?: number
}) {
  return (
    <div className="card bg-base-100 border border-base-300/60 p-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-${color}/10 text-${color}`}>
        {icon}
      </div>
      <p className="text-xl sm:text-2xl font-bold">{value}</p>
      <p className="text-xs sm:text-sm text-base-content/50 mt-0.5">{label}</p>
      {typeof progress === 'number' && (
        <progress className={`progress progress-${color} w-full mt-2 h-1.5`} value={progress} max={100} />
      )}
    </div>
  )
}

function QuickAction({
  href,
  icon,
  label,
  sublabel,
}: {
  href: string
  icon: React.ReactNode
  label: string
  sublabel: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 rounded-xl border border-base-300/60 bg-base-100 hover:border-primary/30 hover:bg-primary/5 transition-colors group"
    >
      <div className="w-10 h-10 rounded-lg bg-base-200 flex items-center justify-center text-base-content/60 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-base-content/50">{sublabel}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-base-content/20 ml-auto group-hover:text-primary/60 transition-colors" />
    </Link>
  )
}
