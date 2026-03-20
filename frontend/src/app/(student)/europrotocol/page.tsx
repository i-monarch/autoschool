'use client'

import {
  FileText, CheckCircle, AlertTriangle, Camera, Phone, Car,
  ClipboardList, PenTool, MapPin, Users, Shield,
} from 'lucide-react'

const steps = [
  'Заповнюйте бланк кульковою ручкою',
  'Заповніть дату, час та місце ДТП',
  'Вкажіть кількість пошкоджених ТЗ (не більше 2)',
  'Запишіть дані свідків (якщо є)',
  'Заповніть дані про ТЗ та водіїв (обидві сторони)',
  'Вкажіть страхову компанію та номер полісу',
  'Позначте місця пошкоджень на схемі ТЗ',
  'Намалюйте схему ДТП',
  'Відмітьте обставини ДТП (галочками)',
  'Обидва водії підписують протокол',
]

const conditions = [
  'Немає потерпілих (травмованих або загиблих)',
  'В ДТП беруть участь не більше двох транспортних засобів',
  'Обидва водії мають чинний поліс ОСЦПВ',
  'Обидва водії згодні з обставинами ДТП',
  'Розмір збитків не перевищує встановлений ліміт',
  'Обидва водії не перебувають у стані алкогольного сп\'яніння',
]

const warnings = [
  {
    icon: ClipboardList,
    text: 'Завжди тримайте бланк європротоколу в автомобілі',
  },
  {
    icon: Camera,
    text: 'Фотографуйте місце ДТП, пошкодження та документи',
  },
  {
    icon: Phone,
    text: 'Протягом 3 днів повідомте страхову компанію',
  },
  {
    icon: Car,
    text: 'Не переміщуйте автомобілі до заповнення протоколу',
  },
]

export default function EuroprotocolPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Європротокол</h1>
            <p className="text-base-content/50 text-sm">Приклад заповнення європротоколу при ДТП</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* What is europrotocol */}
        <div className="card bg-base-100 border border-base-300/60">
          <div className="card-body">
            <h2 className="card-title text-lg">
              <Shield className="w-5 h-5 text-primary" />
              Що таке європротокол?
            </h2>
            <p className="text-base-content/70 leading-relaxed">
              Європротокол — це спрощена процедура оформлення ДТП без виклику поліції.
              Використовується коли: немає потерпілих, учасників не більше двох,
              обидва водії згодні з обставинами ДТП, розмір збитків не перевищує ліміт.
            </p>
          </div>
        </div>

        {/* When can be used */}
        <div className="card bg-base-100 border border-base-300/60">
          <div className="card-body">
            <h2 className="card-title text-lg">
              <CheckCircle className="w-5 h-5 text-success" />
              Коли можна використовувати?
            </h2>
            <ul className="space-y-2 mt-2">
              {conditions.map((condition, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-base-content/70">{condition}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* How to fill */}
        <div className="card bg-base-100 border border-base-300/60">
          <div className="card-body">
            <h2 className="card-title text-lg">
              <PenTool className="w-5 h-5 text-info" />
              Як заповнювати?
            </h2>
            <ol className="space-y-3 mt-2">
              {steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-base-content/70 pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Important to remember */}
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Важливо пам&apos;ятати
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {warnings.map((warning, i) => (
              <div key={i} className="alert bg-warning/10 border border-warning/20">
                <warning.icon className="w-5 h-5 text-warning flex-shrink-0" />
                <span className="text-sm">{warning.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
