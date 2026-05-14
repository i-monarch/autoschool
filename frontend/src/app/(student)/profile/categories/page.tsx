'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/components/ui/Toast'
import type { User } from '@/types/auth'

const CATEGORY_GRID: Array<Array<string | null>> = [
  [null, 'BE', 'CE', 'DE', null],
  ['A', 'B', 'C', 'D', 'T'],
  ['A1', 'B1', 'C1', 'D1', null],
  [null, null, 'C1E', 'D1E', null],
]

export default function ProfileCategoriesPage() {
  const router = useRouter()
  const toast = useToast()
  const user = useAuthStore((s) => s.user)
  const fetchMe = useAuthStore((s) => s.fetchMe)
  const setUser = useAuthStore((s) => s.setUser)
  const [selected, setSelected] = useState<string[]>(user?.license_categories ?? ['B'])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) {
      void fetchMe()
    }
  }, [fetchMe, user])

  useEffect(() => {
    setSelected(user?.license_categories?.length ? user.license_categories : ['B'])
  }, [user])

  const toggleCategory = (category: string) => {
    setSelected((current) => {
      if (!current.includes(category)) {
        return [...current, category]
      }
      if (current.length === 1) {
        toast.add('Виберіть хоча б одну категорію', 'warning')
        return current
      }
      return current.filter((item) => item !== category)
    })
  }

  const handleSave = async () => {
    if (selected.length === 0) {
      toast.add('Виберіть хоча б одну категорію', 'warning')
      return
    }

    setSaving(true)
    try {
      const { data } = await api.patch<User>('/users/me/', {
        license_categories: selected,
      })
      setUser(data)
      toast.add('Збережено', 'success')
      router.push('/profile')
    } catch {
      toast.add('Не вдалося зберегти категорії', 'error')
    } finally {
      setSaving(false)
    }
  }

  const canSave = selected.length > 0

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Link href="/profile" className="btn btn-ghost btn-circle btn-sm" aria-label="Назад">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Категорії</h1>
        </div>
        <p className="text-base-content/60 text-sm mt-2">Виберіть свої навчальні категорії</p>
      </div>

      <div className="card bg-base-100 border border-base-300/60">
        <div className="card-body p-5">
          <div className="grid grid-cols-5 gap-3 justify-center mx-auto">
            {CATEGORY_GRID.flatMap((row, rowIndex) => (
              row.map((category, colIndex) => (
                category ? (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className={`w-[70px] h-[70px] min-w-[60px] min-h-[60px] rounded-2xl font-bold text-lg transition-colors ${
                      selected.includes(category)
                        ? 'bg-success text-success-content'
                        : 'bg-base-100 border border-base-300 text-base-content'
                    }`}
                    aria-pressed={selected.includes(category)}
                  >
                    {category}
                  </button>
                ) : (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className="w-[70px] h-[70px]"
                    aria-hidden="true"
                  />
                )
              ))
            ))}
          </div>

          <p className="text-sm text-base-content/60 mt-5">
            Обрані категорії: {selected.length ? selected.join(', ') : 'немає'}
          </p>

          <div className="mt-5">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !canSave}
              aria-disabled={!canSave}
              className={`btn btn-primary w-full sm:w-auto ${
                canSave ? '' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              {saving ? <span className="loading loading-spinner loading-sm" /> : 'Зберегти'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
