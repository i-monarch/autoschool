'use client'

import { ClipboardCheck, Plus, Upload } from 'lucide-react'

export default function AdminTestsPage() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Тести</h1>
          <p className="text-base-content/60 text-sm mt-1">Управління тестами та питаннями ПДР</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-sm btn-outline gap-2" disabled>
            <Upload className="w-4 h-4" />
            Імпорт
          </button>
          <button className="btn btn-sm btn-primary gap-2" disabled>
            <Plus className="w-4 h-4" />
            Додати тест
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="card bg-base-100 border border-base-300/60 p-4">
          <p className="text-2xl font-bold">0</p>
          <p className="text-xs text-base-content/50">Тестів</p>
        </div>
        <div className="card bg-base-100 border border-base-300/60 p-4">
          <p className="text-2xl font-bold">0</p>
          <p className="text-xs text-base-content/50">Питань</p>
        </div>
        <div className="card bg-base-100 border border-base-300/60 p-4">
          <p className="text-2xl font-bold">0</p>
          <p className="text-xs text-base-content/50">Категорій</p>
        </div>
      </div>

      <div className="card bg-base-100 border border-base-300/60">
        <div className="card-body items-center text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-primary/5 flex items-center justify-center mb-4">
            <ClipboardCheck className="w-9 h-9 text-primary/40" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Немає тестів</h3>
          <p className="text-base-content/60 max-w-md text-sm">
            Створіть тести вручну або імпортуйте питання з CSV/Excel файлу.
            Підтримуються тести за темами та режим екзамену.
          </p>
        </div>
      </div>
    </div>
  )
}
