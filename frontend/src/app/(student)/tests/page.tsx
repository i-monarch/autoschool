'use client'

import { ClipboardCheck, Clock, Target, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function TestsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Тести ПДР</h1>
        <p className="text-base-content/60 text-sm mt-1">Тренуйтесь та перевіряйте свої знання</p>
      </div>

      {/* Test modes */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <TestModeCard
          title="За темами"
          description="Оберіть тему та пройдіть тест. Ідеально для вивчення окремих розділів ПДР."
          icon={<Target className="w-6 h-6" />}
          color="primary"
          disabled
        />
        <TestModeCard
          title="Екзамен"
          description="20 випадкових питань, 20 хвилин. Імітація реального іспиту в сервісному центрі."
          icon={<Clock className="w-6 h-6" />}
          color="error"
          disabled
        />
        <TestModeCard
          title="Марафон"
          description="Відповідайте на питання без обмежень часу. Помилки зберігаються для повторення."
          icon={<TrendingUp className="w-6 h-6" />}
          color="accent"
          disabled
        />
      </div>

      {/* Stats placeholder */}
      <h2 className="text-lg font-semibold mb-4">Ваша статистика</h2>
      <div className="card bg-base-100 border border-base-300/60">
        <div className="card-body items-center text-center py-12">
          <div className="w-20 h-20 rounded-2xl bg-success/5 flex items-center justify-center mb-4">
            <ClipboardCheck className="w-9 h-9 text-success/40" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Ще немає результатів</h3>
          <p className="text-base-content/60 max-w-md">
            Пройдіть перший тест, щоб побачити вашу статистику та прогрес по кожній темі.
          </p>
        </div>
      </div>
    </div>
  )
}

function TestModeCard({
  title,
  description,
  icon,
  color,
  disabled,
}: {
  title: string
  description: string
  icon: React.ReactNode
  color: string
  disabled?: boolean
}) {
  return (
    <div className={`card bg-base-100 border border-base-300/60 ${disabled ? 'opacity-60' : 'hover:border-primary/30 cursor-pointer'} transition-colors`}>
      <div className="card-body p-5">
        <div className={`w-12 h-12 rounded-xl bg-${color}/10 text-${color} flex items-center justify-center mb-2`}>
          {icon}
        </div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-base-content/60 leading-relaxed">{description}</p>
        {disabled && (
          <span className="text-xs text-base-content/40 mt-1">Скоро буде доступно</span>
        )}
      </div>
    </div>
  )
}
