import { Bookmark, CheckCircle } from 'lucide-react'
import { PaywallOverlay } from '@/components/ui/PaywallBanner'
import { normalizeQuestionImage } from '@/lib/image'
import type { SavedQuestionItem } from '@/types/testing'

export function TestsSavedTab({
  isPaid,
  loading,
  savedItems,
  onRemoveSaved,
}: {
  isPaid: boolean
  loading: boolean
  savedItems: SavedQuestionItem[]
  onRemoveSaved: (questionId: number) => void
}) {
  if (!isPaid) {
    return (
      <PaywallOverlay message="Доступно в платній версії">
        <div className="space-y-4">
          {[1, 2].map((item) => (
            <div key={item} className="card bg-base-100 border border-base-300/60 p-5">
              <p className="text-xs text-base-content/40 mb-1">Питання #{item * 12}</p>
              <p className="text-sm mb-3">Де заборонено зупинку транспортних засобів?</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm py-1.5 px-3 rounded-lg bg-success/10 text-success">На пішохідному переході</div>
                <div className="flex items-center gap-2 text-sm py-1.5 px-3 rounded-lg text-base-content/50">На узбіччі</div>
              </div>
            </div>
          ))}
        </div>
      </PaywallOverlay>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  if (savedItems.length === 0) {
    return (
      <div className="card bg-base-100 border border-base-300/60">
        <div className="card-body items-center text-center py-12">
          <Bookmark className="w-12 h-12 text-base-content/20 mb-3" />
          <p className="text-base-content/50 mb-1">Збережених питань немає</p>
          <p className="text-sm text-base-content/40">Натисніть на закладку біля питання, щоб зберегти його</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <p className="text-sm text-base-content/50 mb-4">
        {savedItems.length} збережених питань
      </p>
      <div className="space-y-3">
        {savedItems.map((item) => (
          <SavedQuestionCard key={item.id} item={item} onRemoveSaved={onRemoveSaved} />
        ))}
      </div>
    </>
  )
}

function SavedQuestionCard({
  item,
  onRemoveSaved,
}: {
  item: SavedQuestionItem
  onRemoveSaved: (questionId: number) => void
}) {
  return (
    <div className="card bg-base-100 border border-primary/15 p-4">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-xs font-mono text-base-content/30 mt-0.5">#{item.question.number}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium mb-1">{item.question.text}</p>
          {item.question.category_name && (
            <span className="badge badge-ghost badge-sm">{item.question.category_name}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onRemoveSaved(item.question.id)}
          className="btn btn-ghost btn-xs"
          title="Прибрати з збережених"
        >
          <Bookmark className="w-4 h-4 fill-primary text-primary" />
        </button>
      </div>

      {item.question.image && (
        <img
          src={normalizeQuestionImage(item.question.image) || ''}
          alt=""
          className="rounded-lg mb-3 max-h-48 object-contain"
        />
      )}

      <div className="space-y-1.5 mb-3">
        {item.question.answers.map((answer) => (
          <div
            key={answer.id}
            className={`flex items-start gap-2 text-sm py-1.5 px-3 rounded-lg ${
              answer.is_correct ? 'bg-success/10 text-success' : 'text-base-content/50'
            }`}
          >
            {answer.is_correct ? (
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            ) : (
              <div className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{answer.text}</span>
          </div>
        ))}
      </div>

      {item.question.explanation && (
        <div className="bg-base-200/50 rounded-lg p-3">
          <p className="text-xs text-base-content/60 leading-relaxed">{item.question.explanation}</p>
        </div>
      )}
    </div>
  )
}
