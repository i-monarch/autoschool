import { CheckCircle, XCircle } from 'lucide-react'
import { PaywallOverlay } from '@/components/ui/PaywallBanner'
import type { WrongAnswer } from '@/types/testing'

export function TestsMistakesTab({
  isPaid,
  loading,
  wrongAnswers,
}: {
  isPaid: boolean
  loading: boolean
  wrongAnswers: WrongAnswer[]
}) {
  if (!isPaid) {
    return (
      <PaywallOverlay message="Доступно в платній версії">
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="card bg-base-100 border border-base-300/60 p-5">
              <p className="text-xs text-base-content/40 mb-1">Питання #{item * 7}</p>
              <p className="text-sm mb-3">Яка максимальна швидкість руху дозволена в населеному пункті?</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm py-1.5 px-3 rounded-lg bg-error/10 text-error">40 км/год</div>
                <div className="flex items-center gap-2 text-sm py-1.5 px-3 rounded-lg bg-success/10 text-success">50 км/год</div>
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

  if (wrongAnswers.length === 0) {
    return (
      <div className="card bg-base-100 border border-base-300/60">
        <div className="card-body items-center text-center py-12">
          <CheckCircle className="w-12 h-12 text-success/30 mb-3" />
          <p className="text-base-content/50 mb-1">Помилок немає</p>
          <p className="text-sm text-base-content/40">Ви відповіли правильно на всі питання</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <p className="text-sm text-base-content/50 mb-4">
        {wrongAnswers.length} питань, на які ви відповіли неправильно. Розберіть кожне.
      </p>
      <div className="space-y-3">
        {wrongAnswers.map((wrongAnswer) => (
          <WrongAnswerCard key={wrongAnswer.question_id} wrongAnswer={wrongAnswer} />
        ))}
      </div>
    </>
  )
}

function WrongAnswerCard({ wrongAnswer }: { wrongAnswer: WrongAnswer }) {
  return (
    <div className="card bg-base-100 border border-error/15 p-4">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-xs font-mono text-base-content/30 mt-0.5">#{wrongAnswer.question_number}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium mb-1">{wrongAnswer.question_text}</p>
          {wrongAnswer.category_name && (
            <span className="badge badge-ghost badge-sm">{wrongAnswer.category_name}</span>
          )}
        </div>
      </div>

      {wrongAnswer.question_image && (
        <img src={wrongAnswer.question_image} alt="" className="rounded-lg mb-3 max-h-48 object-contain" />
      )}

      <div className="space-y-1.5 mb-3">
        {wrongAnswer.answers.map((answer) => {
          const isSelected = answer.id === wrongAnswer.selected_answer_id
          const isCorrect = answer.is_correct
          let className = 'flex items-start gap-2 text-sm py-1.5 px-3 rounded-lg '
          if (isCorrect) className += 'bg-success/10 text-success'
          else if (isSelected) className += 'bg-error/10 text-error'
          else className += 'text-base-content/50'

          return (
            <div key={answer.id} className={className}>
              {isCorrect ? (
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              ) : isSelected ? (
                <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              ) : (
                <div className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{answer.text}</span>
            </div>
          )
        })}
      </div>

      {wrongAnswer.explanation && (
        <div className="bg-base-200/50 rounded-lg p-3">
          <p className="text-xs text-base-content/60 leading-relaxed">{wrongAnswer.explanation}</p>
        </div>
      )}
    </div>
  )
}
