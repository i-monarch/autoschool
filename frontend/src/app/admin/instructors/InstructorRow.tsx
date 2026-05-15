'use client'

import { BadgeCheck, Clock, MoreHorizontal, Trash2, UserRound, XCircle } from 'lucide-react'
import type { InstructorAdmin } from '@/types/instructors'

interface InstructorRowProps {
  instructor: InstructorAdmin
  actionId: number | null
  onVerify: (instructor: InstructorAdmin) => void
  onReject: (instructor: InstructorAdmin) => void
  onDelete: (instructor: InstructorAdmin) => void
}

function instructorName(instructor: InstructorAdmin) {
  return `${instructor.first_name} ${instructor.last_name}`.trim() || `Інструктор #${instructor.id}`
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function InstructorRow({
  instructor,
  actionId,
  onVerify,
  onReject,
  onDelete,
}: InstructorRowProps) {
  const name = instructorName(instructor)
  const busy = actionId === instructor.id

  return (
    <tr className="hover">
      <td>
        <div className="flex items-center gap-3">
          {instructor.photo ? (
            <img src={instructor.photo} alt={name} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="avatar placeholder">
              <div className="bg-neutral text-neutral-content rounded-full w-10">
                <UserRound className="w-5 h-5" />
              </div>
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium truncate">{name}</p>
            <p className="text-xs text-base-content/50 truncate">{instructor.email}</p>
          </div>
        </div>
      </td>
      <td className="text-sm text-base-content/70">{instructor.city?.name || 'Не вказано'}</td>
      <td className="text-sm text-base-content/70">{instructor.phone || 'Не вказано'}</td>
      <td>
        {instructor.is_verified ? (
          <span className="badge badge-success badge-sm gap-1">
            <BadgeCheck className="w-3 h-3" />
            Підтверджено
          </span>
        ) : (
          <span className="badge badge-warning badge-sm gap-1">
            <Clock className="w-3 h-3" />
            На верифікації
          </span>
        )}
      </td>
      <td className="text-sm text-base-content/60">{formatDate(instructor.created_at)}</td>
      <td>
        <div className="dropdown dropdown-end">
          <button type="button" tabIndex={0} className="btn btn-ghost btn-xs btn-square" disabled={busy}>
            {busy ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <MoreHorizontal className="w-4 h-4" />
            )}
          </button>
          <ul tabIndex={0} className="dropdown-content z-10 menu p-1.5 shadow-lg bg-base-100 border border-base-300/60 rounded-box w-44">
            <li>
              <button type="button" onClick={() => onVerify(instructor)} disabled={instructor.is_verified}>
                <BadgeCheck className="w-4 h-4 text-success" />
                Підтвердити
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onReject(instructor)}>
                <XCircle className="w-4 h-4 text-warning" />
                Відхилити
              </button>
            </li>
            <li>
              <button type="button" className="text-error" onClick={() => onDelete(instructor)}>
                <Trash2 className="w-4 h-4" />
                Видалити
              </button>
            </li>
          </ul>
        </div>
      </td>
    </tr>
  )
}
