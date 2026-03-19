'use client'

import { Calendar, Clock, Video } from 'lucide-react'

export default function SchedulePage() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Розклад занять</h1>
          <p className="text-base-content/60 text-sm mt-1">Онлайн-заняття з викладачем</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed bg-base-200/50 p-1 mb-6 w-fit">
        <button className="tab tab-sm tab-active">Записатися</button>
        <button className="tab tab-sm">Мої заняття</button>
      </div>

      {/* Empty state */}
      <div className="card bg-base-100 border border-base-300/60">
        <div className="card-body items-center text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-info/5 flex items-center justify-center mb-4">
            <Calendar className="w-9 h-9 text-info/40" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Немає доступних занять</h3>
          <p className="text-base-content/60 max-w-md">
            Тут ви зможете обрати зручний час та записатися на онлайн-заняття
            з викладачем через Zoom або Google Meet.
          </p>
          <div className="flex flex-wrap gap-4 mt-6 text-sm text-base-content/50">
            <div className="flex items-center gap-1.5">
              <Video className="w-4 h-4" />
              <span>Zoom / Google Meet</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>45-60 хвилин</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
