'use client'

import { Lock } from 'lucide-react'
import Link from 'next/link'

interface PaywallBannerProps {
  message?: string
  className?: string
}

export default function PaywallBanner({
  message = 'Доступно в платній версії',
  className = '',
}: PaywallBannerProps) {
  return (
    <div className={`text-center py-6 ${className}`}>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-base-200/80 text-sm text-base-content/60">
        <Lock className="w-3.5 h-3.5" />
        {message}
      </div>
      <div className="mt-3">
        <Link href="/payments" className="btn btn-primary btn-sm btn-outline">
          Дізнатись більше
        </Link>
      </div>
    </div>
  )
}

export function PaywallOverlay({
  children,
  message = 'Доступно в платній версії',
}: {
  children: React.ReactNode
  message?: string
}) {
  return (
    <div className="relative">
      <div className="blur-[2px] opacity-60 pointer-events-none select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center bg-base-100/90 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-lg border border-base-300/60">
          <Lock className="w-5 h-5 text-base-content/40 mx-auto mb-2" />
          <p className="text-sm font-medium mb-3">{message}</p>
          <Link href="/payments" className="btn btn-primary btn-sm btn-outline">
            Дізнатись більше
          </Link>
        </div>
      </div>
    </div>
  )
}
