'use client'

import { Lock } from 'lucide-react'
import Link from 'next/link'

interface PaywallBannerProps {
  message?: string
  className?: string
}

export default function PaywallBanner({
  message = 'Цей контент доступний лише для оплачених акаунтів',
  className = '',
}: PaywallBannerProps) {
  return (
    <div className={`card bg-base-100 border border-warning/30 ${className}`}>
      <div className="card-body items-center text-center py-10">
        <div className="w-14 h-14 rounded-2xl bg-warning/10 flex items-center justify-center mb-3">
          <Lock className="w-7 h-7 text-warning" />
        </div>
        <p className="font-semibold text-lg mb-1">Потрібна оплата</p>
        <p className="text-base-content/60 text-sm max-w-md mb-4">{message}</p>
        <Link href="/payments" className="btn btn-warning btn-sm">
          Оформити підписку
        </Link>
      </div>
    </div>
  )
}
