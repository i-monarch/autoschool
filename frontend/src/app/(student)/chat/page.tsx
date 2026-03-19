'use client'

import { MessageCircle, Send } from 'lucide-react'

export default function ChatPage() {
  return (
    <div className="h-[calc(100vh-10rem)] lg:h-[calc(100vh-7rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Повідомлення</h1>
        <p className="text-base-content/60 text-sm mt-1">Чат з вашим викладачем</p>
      </div>

      <div className="flex-1 flex rounded-xl border border-base-300/60 bg-base-100 overflow-hidden">
        {/* Chat list - desktop */}
        <div className="hidden md:flex flex-col w-72 border-r border-base-300/60">
          <div className="p-3 border-b border-base-300/40">
            <input
              type="text"
              placeholder="Пошук..."
              className="input input-bordered input-sm w-full"
            />
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <p className="text-sm text-base-content/40 text-center">Немає чатів</p>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-secondary/5 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-9 h-9 text-secondary/40" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Оберіть чат</h3>
              <p className="text-base-content/60 max-w-sm text-sm">
                Тут ви зможете спілкуватися з вашим викладачем, задавати питання
                та отримувати відповіді.
              </p>
            </div>
          </div>

          {/* Input area */}
          <div className="p-3 border-t border-base-300/40">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Написати повідомлення..."
                className="input input-bordered input-sm flex-1"
                disabled
              />
              <button className="btn btn-primary btn-sm btn-square" disabled>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
