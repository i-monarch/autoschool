'use client'

import { CreditCard, Check, Crown, Zap } from 'lucide-react'

export default function PaymentsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Оплата та тарифи</h1>
        <p className="text-base-content/60 text-sm mt-1">Оберіть тариф для доступу до навчання</p>
      </div>

      {/* Subscription status */}
      <div className="alert bg-warning/10 border border-warning/20 mb-8">
        <CreditCard className="w-5 h-5 text-warning" />
        <div>
          <p className="font-medium text-sm">Немає активної підписки</p>
          <p className="text-xs text-base-content/60">Оберіть тариф, щоб отримати доступ до курсів, тестів та занять</p>
        </div>
      </div>

      {/* Tariffs */}
      <h2 className="text-lg font-semibold mb-4">Тарифи</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <TariffCard
          name="Базовий"
          price="2 500"
          period="1 місяць"
          features={[
            'Доступ до відеоуроків',
            'Тести ПДР',
            'Чат з викладачем',
          ]}
          icon={<Zap className="w-5 h-5" />}
          color="primary"
        />
        <TariffCard
          name="Стандарт"
          price="4 500"
          period="3 місяці"
          features={[
            'Все з Базового',
            '4 онлайн-заняття',
            'Розбір ситуацій',
            'Пріоритетна підтримка',
          ]}
          popular
          icon={<Crown className="w-5 h-5" />}
          color="secondary"
        />
        <TariffCard
          name="Повний курс"
          price="7 000"
          period="6 місяців"
          features={[
            'Все зі Стандарту',
            '10 онлайн-занять',
            'Гарантія здачі іспиту',
            'Необмежений доступ',
          ]}
          icon={<Check className="w-5 h-5" />}
          color="accent"
        />
      </div>

      {/* Payment history */}
      <h2 className="text-lg font-semibold mb-4">Історія платежів</h2>
      <div className="card bg-base-100 border border-base-300/60">
        <div className="card-body items-center text-center py-10">
          <p className="text-base-content/50 text-sm">Платежів ще немає</p>
        </div>
      </div>
    </div>
  )
}

function TariffCard({
  name,
  price,
  period,
  features,
  popular,
  icon,
  color,
}: {
  name: string
  price: string
  period: string
  features: string[]
  popular?: boolean
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className={`card bg-base-100 border ${popular ? 'border-secondary shadow-md' : 'border-base-300/60'} relative`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="badge badge-secondary badge-sm font-medium">Популярний</span>
        </div>
      )}
      <div className="card-body p-5">
        <div className={`w-10 h-10 rounded-xl bg-${color}/10 text-${color} flex items-center justify-center`}>
          {icon}
        </div>
        <h3 className="font-semibold text-lg mt-2">{name}</h3>
        <div className="mt-1">
          <span className="text-3xl font-bold">{price}</span>
          <span className="text-base-content/60 text-sm ml-1">грн / {period}</span>
        </div>
        <ul className="mt-4 space-y-2">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <button className={`btn btn-sm mt-4 ${popular ? 'btn-secondary' : 'btn-outline'}`} disabled>
          Обрати тариф
        </button>
      </div>
    </div>
  )
}
