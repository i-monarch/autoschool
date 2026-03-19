import { Car, Phone, Mail, MessageCircle } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AutoSchool - Авторизацiя',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - branding + support */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary text-primary-content flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary-content/20 flex items-center justify-center">
              <Car className="w-7 h-7" />
            </div>
            <span className="text-2xl font-bold">AutoSchool</span>
          </div>

          <h1 className="text-4xl font-bold leading-tight mb-4">
            Онлайн-автошкола нового покоління
          </h1>
          <p className="text-lg opacity-80 leading-relaxed max-w-md">
            Вивчайте ПДР, проходьте тести та готуйтесь до іспиту
            у зручному форматі — з будь-якого пристрою, у будь-який час.
          </p>

          <div className="mt-12 space-y-4">
            <Feature text="Відеоуроки від досвідчених викладачів" />
            <Feature text="Тести ПДР з поясненнями" />
            <Feature text="Онлайн-заняття з інструктором" />
            <Feature text="Підготовка до іспиту в сервісному центрі" />
          </div>
        </div>

        {/* Support block */}
        <div className="mt-8 p-6 rounded-2xl bg-primary-content/10 backdrop-blur-sm">
          <h3 className="font-semibold text-lg mb-3">Потрібна допомога?</h3>
          <div className="space-y-2">
            <a
              href="tel:+380XXXXXXXXX"
              className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity"
            >
              <Phone className="w-4 h-4" />
              <span>+380 (XX) XXX-XX-XX</span>
            </a>
            <a
              href="mailto:support@autoschool.com.ua"
              className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity"
            >
              <Mail className="w-4 h-4" />
              <span>support@autoschool.com.ua</span>
            </a>
            <a
              href="https://t.me/autoschool_support"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Telegram підтримка</span>
            </a>
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden p-4 flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Car className="w-5 h-5 text-primary-content" />
          </div>
          <span className="text-xl font-bold">AutoSchool</span>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>

        {/* Mobile support */}
        <div className="lg:hidden p-4 border-t border-base-200">
          <div className="flex flex-wrap gap-4 justify-center text-sm text-base-content/60">
            <a href="tel:+380XXXXXXXXX" className="flex items-center gap-1 hover:text-primary">
              <Phone className="w-3.5 h-3.5" />
              Зателефонувати
            </a>
            <a href="mailto:support@autoschool.com.ua" className="flex items-center gap-1 hover:text-primary">
              <Mail className="w-3.5 h-3.5" />
              Написати
            </a>
            <a href="https://t.me/autoschool_support" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
              <MessageCircle className="w-3.5 h-3.5" />
              Telegram
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-2 h-2 rounded-full bg-primary-content/60" />
      <span className="opacity-80">{text}</span>
    </div>
  )
}
