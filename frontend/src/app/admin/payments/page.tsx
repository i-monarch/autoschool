'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, GripVertical, Tag, Eye, EyeOff, X } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import api from '@/lib/api'

interface Tariff {
  id: number
  name: string
  description: string
  price: string
  duration_days: number
  features: string[]
  is_popular: boolean
  is_active: boolean
  order: number
}

interface TariffForm {
  name: string
  description: string
  price: string
  duration_days: number
  features: string[]
  is_popular: boolean
  is_active: boolean
}

const emptyForm: TariffForm = {
  name: '',
  description: '',
  price: '',
  duration_days: 30,
  features: [],
  is_popular: false,
  is_active: true,
}

function SortableTariffRow({
  tariff,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  tariff: Tariff
  onEdit: (t: Tariff) => void
  onDelete: (t: Tariff) => void
  onToggleActive: (t: Tariff) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: tariff.id,
  })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-base-200/30">
      <td className="w-10">
        <button className="btn btn-ghost btn-xs cursor-grab" {...attributes} {...listeners}>
          <GripVertical className="w-4 h-4 text-base-content/30" />
        </button>
      </td>
      <td>
        <div className="flex items-center gap-2">
          <span className="font-medium">{tariff.name}</span>
          {tariff.is_popular && <span className="badge badge-secondary badge-xs">Популярний</span>}
        </div>
      </td>
      <td className="font-mono">{Number(tariff.price).toLocaleString('uk-UA')} грн</td>
      <td>{formatDuration(tariff.duration_days)}</td>
      <td>{tariff.features.length} пунктів</td>
      <td>
        <button
          onClick={() => onToggleActive(tariff)}
          className={`btn btn-ghost btn-xs ${tariff.is_active ? 'text-success' : 'text-base-content/30'}`}
        >
          {tariff.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
      </td>
      <td>
        <div className="flex gap-1">
          <button onClick={() => onEdit(tariff)} className="btn btn-ghost btn-xs">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(tariff)} className="btn btn-ghost btn-xs text-error">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

function formatDuration(days: number): string {
  if (days % 365 === 0) return `${days / 365} рік`
  if (days % 30 === 0) return `${days / 30} міс.`
  return `${days} дн.`
}

export default function AdminPaymentsPage() {
  const [tariffs, setTariffs] = useState<Tariff[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTariff, setEditingTariff] = useState<Tariff | null>(null)
  const [form, setForm] = useState<TariffForm>(emptyForm)
  const [featureInput, setFeatureInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<Tariff | null>(null)
  const [stats, setStats] = useState({ total: 0, active: 0 })

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const fetchTariffs = useCallback(async () => {
    try {
      const { data } = await api.get<Tariff[]>('/admin/payments/tariffs/')
      setTariffs(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/payments/tariffs/stats/')
      setStats(data)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    fetchTariffs()
    fetchStats()
  }, [fetchTariffs, fetchStats])

  function openCreate() {
    setEditingTariff(null)
    setForm(emptyForm)
    setFeatureInput('')
    setModalOpen(true)
  }

  function openEdit(tariff: Tariff) {
    setEditingTariff(tariff)
    setForm({
      name: tariff.name,
      description: tariff.description,
      price: tariff.price,
      duration_days: tariff.duration_days,
      features: [...tariff.features],
      is_popular: tariff.is_popular,
      is_active: tariff.is_active,
    })
    setFeatureInput('')
    setModalOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (editingTariff) {
        await api.patch(`/admin/payments/tariffs/${editingTariff.id}/`, form)
      } else {
        await api.post('/admin/payments/tariffs/', form)
      }
      setModalOpen(false)
      fetchTariffs()
      fetchStats()
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(tariff: Tariff) {
    try {
      await api.delete(`/admin/payments/tariffs/${tariff.id}/`)
      setDeleteConfirm(null)
      fetchTariffs()
      fetchStats()
    } catch {
      // ignore
    }
  }

  async function handleToggleActive(tariff: Tariff) {
    try {
      await api.patch(`/admin/payments/tariffs/${tariff.id}/`, {
        is_active: !tariff.is_active,
      })
      fetchTariffs()
      fetchStats()
    } catch {
      // ignore
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = tariffs.findIndex((t) => t.id === active.id)
    const newIndex = tariffs.findIndex((t) => t.id === over.id)
    const reordered = arrayMove(tariffs, oldIndex, newIndex)
    setTariffs(reordered)

    try {
      await api.post('/admin/payments/tariffs/reorder/', {
        ordered_ids: reordered.map((t) => t.id),
      })
    } catch {
      fetchTariffs()
    }
  }

  function addFeature() {
    const trimmed = featureInput.trim()
    if (!trimmed || form.features.includes(trimmed)) return
    setForm({ ...form, features: [...form.features, trimmed] })
    setFeatureInput('')
  }

  function removeFeature(index: number) {
    setForm({ ...form, features: form.features.filter((_, i) => i !== index) })
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Тарифи</h1>
          <p className="text-base-content/60 text-sm mt-1">Управління тарифними планами</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary btn-sm gap-2">
          <Plus className="w-4 h-4" />
          Додати тариф
        </button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="card bg-base-100 border border-base-300/60 p-4">
          <p className="text-xs text-base-content/50 mb-1">Всього тарифів</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="card bg-base-100 border border-base-300/60 p-4">
          <p className="text-xs text-base-content/50 mb-1">Активних</p>
          <p className="text-2xl font-bold">{stats.active}</p>
        </div>
      </div>

      {/* Table */}
      <div className="card bg-base-100 border border-base-300/60">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="text-xs text-base-content/50">
                  <th className="w-10"></th>
                  <th>Назва</th>
                  <th>Ціна</th>
                  <th>Тривалість</th>
                  <th>Переваги</th>
                  <th>Статус</th>
                  <th>Дії</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <span className="loading loading-spinner loading-md" />
                    </td>
                  </tr>
                ) : tariffs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-sm text-base-content/40 py-12">
                      <Tag className="w-8 h-8 mx-auto text-base-content/20 mb-2" />
                      <p>Тарифів поки немає</p>
                    </td>
                  </tr>
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={tariffs.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                      {tariffs.map((tariff) => (
                        <SortableTariffRow
                          key={tariff.id}
                          tariff={tariff}
                          onEdit={openEdit}
                          onDelete={setDeleteConfirm}
                          onToggleActive={handleToggleActive}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg">
            <h3 className="font-bold text-lg mb-4">
              {editingTariff ? 'Редагувати тариф' : 'Новий тариф'}
            </h3>

            <div className="space-y-4">
              <div className="form-control">
                <label className="label"><span className="label-text text-sm">Назва</span></label>
                <input
                  type="text"
                  className="input input-bordered input-sm"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Базовий"
                />
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text text-sm">Опис</span></label>
                <textarea
                  className="textarea textarea-bordered textarea-sm"
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Короткий опис тарифу"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text text-sm">Ціна (грн)</span></label>
                  <input
                    type="number"
                    className="input input-bordered input-sm"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="2500"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text text-sm">Тривалість (днів)</span></label>
                  <input
                    type="number"
                    className="input input-bordered input-sm"
                    value={form.duration_days}
                    onChange={(e) => setForm({ ...form, duration_days: Number(e.target.value) })}
                    placeholder="30"
                    min="1"
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text text-sm">Переваги</span></label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input input-bordered input-sm flex-1"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    placeholder="Додати перевагу..."
                  />
                  <button onClick={addFeature} className="btn btn-sm btn-ghost" type="button">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {form.features.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.features.map((f, i) => (
                      <span key={i} className="badge badge-outline gap-1 text-xs">
                        {f}
                        <button onClick={() => removeFeature(i)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-6">
                <label className="label cursor-pointer gap-2">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm checkbox-secondary"
                    checked={form.is_popular}
                    onChange={(e) => setForm({ ...form, is_popular: e.target.checked })}
                  />
                  <span className="label-text text-sm">Популярний</span>
                </label>
                <label className="label cursor-pointer gap-2">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm checkbox-success"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  />
                  <span className="label-text text-sm">Активний</span>
                </label>
              </div>
            </div>

            <div className="modal-action">
              <button onClick={() => setModalOpen(false)} className="btn btn-sm btn-ghost">
                Скасувати
              </button>
              <button
                onClick={handleSave}
                className="btn btn-sm btn-primary"
                disabled={saving || !form.name || !form.price}
              >
                {saving ? <span className="loading loading-spinner loading-xs" /> : null}
                {editingTariff ? 'Зберегти' : 'Створити'}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setModalOpen(false)} />
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <h3 className="font-bold text-lg mb-2">Видалити тариф?</h3>
            <p className="text-sm text-base-content/60">
              Тариф &quot;{deleteConfirm.name}&quot; буде видалено. Цю дію не можна скасувати.
            </p>
            <div className="modal-action">
              <button onClick={() => setDeleteConfirm(null)} className="btn btn-sm btn-ghost">
                Скасувати
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="btn btn-sm btn-error">
                Видалити
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)} />
        </div>
      )}
    </div>
  )
}
