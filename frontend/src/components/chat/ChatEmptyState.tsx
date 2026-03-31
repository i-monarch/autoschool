'use client'

import { MessageCircle } from 'lucide-react'

export default function ChatEmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-9 h-9 text-primary/40" />
        </div>
        <h3 className="font-semibold text-lg mb-1">Оберіть чат</h3>
        <p className="text-base-content/60 max-w-sm text-sm">
          Оберіть чат зі списку або створіть новий, щоб почати спілкування.
        </p>
      </div>
    </div>
  )
}
