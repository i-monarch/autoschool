'use client'

interface Props {
  visible: boolean
}

export default function TypingIndicator({ visible }: Props) {
  if (!visible) return null

  return (
    <div className="px-4 py-1">
      <div className="flex items-center gap-1.5 text-xs text-base-content/50">
        <span className="flex gap-0.5">
          <span className="w-1.5 h-1.5 bg-base-content/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-base-content/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-base-content/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </span>
        <span>друкує...</span>
      </div>
    </div>
  )
}
