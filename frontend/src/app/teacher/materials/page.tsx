'use client'

import { FolderOpen, Plus, FileText, Image } from 'lucide-react'

export default function TeacherMaterialsPage() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Матеріали</h1>
          <p className="text-base-content/60 text-sm mt-1">Розбір ситуацій та навчальні матеріали</p>
        </div>
        <button className="btn btn-secondary btn-sm gap-2" disabled>
          <Plus className="w-4 h-4" />
          Додати ситуацію
        </button>
      </div>

      <div className="tabs tabs-boxed bg-base-200/50 p-1 mb-6 w-fit">
        <button className="tab tab-sm tab-active">Ситуації</button>
        <button className="tab tab-sm">Документи</button>
      </div>

      <div className="card bg-base-100 border border-base-300/60">
        <div className="card-body items-center text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-accent/5 flex items-center justify-center mb-4">
            <FolderOpen className="w-9 h-9 text-accent/40" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Немає матеріалів</h3>
          <p className="text-base-content/60 max-w-md text-sm">
            Додавайте розбір дорожніх ситуацій з фото, відео та схемами.
            Учні зможуть переглядати їх та залишати коментарі.
          </p>
          <div className="flex gap-4 mt-6 text-sm text-base-content/50">
            <div className="flex items-center gap-1.5">
              <Image className="w-4 h-4" />
              <span>Фото та схеми</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span>Опис ситуації</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
