'use client'

import { BookOpen, Plus, Video, FileText } from 'lucide-react'

export default function AdminContentPage() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Контент</h1>
          <p className="text-base-content/60 text-sm mt-1">Управління курсами, уроками та відео</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-sm btn-outline gap-2" disabled>
            <Plus className="w-4 h-4" />
            Додати курс
          </button>
          <button className="btn btn-sm btn-primary gap-2" disabled>
            <Video className="w-4 h-4" />
            Завантажити відео
          </button>
        </div>
      </div>

      <div className="tabs tabs-boxed bg-base-200/50 p-1 mb-6 w-fit">
        <button className="tab tab-sm tab-active">Курси</button>
        <button className="tab tab-sm">Уроки</button>
        <button className="tab tab-sm">Відео</button>
      </div>

      <div className="card bg-base-100 border border-base-300/60">
        <div className="card-body items-center text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-info/5 flex items-center justify-center mb-4">
            <BookOpen className="w-9 h-9 text-info/40" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Немає контенту</h3>
          <p className="text-base-content/60 max-w-md text-sm">
            Створіть перший курс та додайте уроки з відео-матеріалами.
          </p>
          <div className="flex gap-4 mt-6 text-sm text-base-content/50">
            <div className="flex items-center gap-1.5">
              <Video className="w-4 h-4" />
              <span>HLS стрімінг</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span>Текстові матеріали</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
