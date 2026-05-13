import { Phone, Mail, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'logicpdd — Авторизація',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - branding + support */}
      <div className="hidden lg:flex lg:w-1/2 bg-neutral text-neutral-content flex-col justify-between p-12">
        <div>
          <div className="flex items-center mb-8">
            <div className="bg-white rounded-xl px-4 py-2.5">
              <Image
                src="/logo.png"
                alt="logicpdd"
                width={650}
                height={236}
                priority
                className="h-10 w-auto"
              />
            </div>
          </div>

          <h1 className="text-4xl font-bold leading-tight mb-4">
            Онлайн-автошкола<br />нового покоління
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed max-w-md">
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
        <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="font-semibold text-lg mb-3">Потрібна допомога?</h3>
          <div className="space-y-3">
            <a
              href="tel:+380XXXXXXXXX"
              className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
            >
              <Phone className="w-4 h-4 text-primary" />
              <span>+380 (XX) XXX-XX-XX</span>
            </a>
            <a
              href="mailto:support@autoschool.com.ua"
              className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
            >
              <Mail className="w-4 h-4 text-primary" />
              <span>support@autoschool.com.ua</span>
            </a>
            <a
              href="https://t.me/autoschool_support"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-primary" />
              <span>Telegram підтримка</span>
            </a>
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden p-4 flex items-center">
          <Image
            src="/logo.png"
            alt="logicpdd"
            width={650}
            height={236}
            priority
            className="h-9 w-auto"
          />
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
      <div className="w-2 h-2 rounded-full bg-primary" />
      <span className="text-gray-300">{text}</span>
    </div>
  )
}
