import { CreditCard } from 'lucide-react'
import Link from 'next/link'

export function LicenseCategoriesCard({ categories }: { categories: string[] }) {
  const categoryText = categories.length ? categories.join(', ') : 'Не вибрано'

  return (
    <div className="card bg-base-100 border border-base-300/60">
      <div className="card-body p-5">
        <h2 className="font-semibold flex items-center gap-2 mb-3">
          <CreditCard className="w-4.5 h-4.5 text-base-content/60" />
          Категорії прав
        </h2>
        <p className="text-sm font-medium">{categoryText}</p>
        <div className="mt-4">
          <Link href="/profile/categories" className="btn btn-sm btn-outline">
            Налаштувати
          </Link>
        </div>
      </div>
    </div>
  )
}
