import type { ReactNode } from 'react'

export function InfoField({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: ReactNode
}) {
  return (
    <div>
      <p className="text-xs text-base-content/50 mb-1">{label}</p>
      <p className="text-sm font-medium flex items-center gap-1.5">
        {icon && <span className="text-base-content/40">{icon}</span>}
        {value}
      </p>
    </div>
  )
}
