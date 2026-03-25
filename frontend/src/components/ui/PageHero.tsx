import type { ReactNode } from 'react'

type AccentColor = 'primary' | 'secondary' | 'error' | 'info' | 'warning' | 'accent' | 'success'

interface PageHeroProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  accentColor?: AccentColor
  children?: ReactNode
}

const COLOR_MAP: Record<AccentColor, { gradient: string; border: string; iconBg: string; iconText: string }> = {
  primary: {
    gradient: 'from-primary/8 border-primary/10',
    border: 'border-primary/10',
    iconBg: 'bg-primary/10',
    iconText: 'text-primary',
  },
  secondary: {
    gradient: 'from-secondary/8 border-secondary/10',
    border: 'border-secondary/10',
    iconBg: 'bg-secondary/10',
    iconText: 'text-secondary',
  },
  error: {
    gradient: 'from-error/8 border-error/10',
    border: 'border-error/10',
    iconBg: 'bg-error/10',
    iconText: 'text-error',
  },
  info: {
    gradient: 'from-info/8 border-info/10',
    border: 'border-info/10',
    iconBg: 'bg-info/10',
    iconText: 'text-info',
  },
  warning: {
    gradient: 'from-warning/8 border-warning/10',
    border: 'border-warning/10',
    iconBg: 'bg-warning/10',
    iconText: 'text-warning',
  },
  accent: {
    gradient: 'from-accent/8 border-accent/10',
    border: 'border-accent/10',
    iconBg: 'bg-accent/10',
    iconText: 'text-accent',
  },
  success: {
    gradient: 'from-success/8 border-success/10',
    border: 'border-success/10',
    iconBg: 'bg-success/10',
    iconText: 'text-success',
  },
}

export function PageHero({ title, subtitle, icon, accentColor = 'primary', children }: PageHeroProps) {
  const colors = COLOR_MAP[accentColor]

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors.gradient} via-base-100 to-base-200/50 border mb-8`}>
      {/* Decorative road elements */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {/* Dashed road line */}
        <svg className="absolute -right-4 top-0 h-full w-24 opacity-[0.06]" viewBox="0 0 80 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="36" y="10" width="8" height="35" rx="4" fill="currentColor" />
          <rect x="36" y="65" width="8" height="35" rx="4" fill="currentColor" />
          <rect x="36" y="120" width="8" height="35" rx="4" fill="currentColor" />
          <rect x="36" y="175" width="8" height="35" rx="4" fill="currentColor" />
          <rect x="36" y="230" width="8" height="35" rx="4" fill="currentColor" />
          <line x1="20" y1="0" x2="20" y2="300" stroke="currentColor" strokeWidth="2" opacity="0.5" />
          <line x1="60" y1="0" x2="60" y2="300" stroke="currentColor" strokeWidth="2" opacity="0.5" />
        </svg>

        {/* Speed limit sign silhouette */}
        <svg className="absolute right-16 top-3 w-14 h-14 opacity-[0.04]" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="3" />
          <text x="24" y="30" textAnchor="middle" fontSize="18" fontWeight="bold" fill="currentColor">50</text>
        </svg>

        {/* Warning triangle sign */}
        <svg className="absolute right-36 bottom-2 w-12 h-12 opacity-[0.04]" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="24,2 46,42 2,42" stroke="currentColor" strokeWidth="3" fill="none" />
          <text x="24" y="36" textAnchor="middle" fontSize="16" fontWeight="bold" fill="currentColor">!</text>
        </svg>

        {/* Stop sign silhouette */}
        <svg className="absolute left-[60%] top-1 w-10 h-10 opacity-[0.03]" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="12,0 28,0 40,12 40,28 28,40 12,40 0,28 0,12" stroke="currentColor" strokeWidth="2.5" fill="none" />
        </svg>
      </div>

      <div className="relative px-5 py-6 sm:px-6 sm:py-7 flex items-center gap-4">
        {icon && (
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${colors.iconBg} ${colors.iconText} flex items-center justify-center flex-shrink-0`}>
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
          {subtitle && (
            <p className="text-base-content/50 text-sm mt-1 capitalize">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}
