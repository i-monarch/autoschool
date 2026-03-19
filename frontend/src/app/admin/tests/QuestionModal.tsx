'use client'

import { useEffect, useState, useRef } from 'react'
import { X, Plus, Trash2, Upload, GripVertical, Check } from 'lucide-react'
import api from '@/lib/api'
import { useToast } from '@/components/ui/Toast'
import type { TestCategory, QuestionDetail, Answer } from '@/types/testing'

interface Props {
  questionId: number | null
  categories: TestCategory[]
  defaultCategory: number | null
  onClose: () => void
  onSaved: () => void
}

const emptyAnswer = (): Answer => ({ text: '', is_correct: false, order: 0 })

export default function QuestionModal({ questionId, categories, defaultCategory, onClose, onSaved }: Props) {
  const toast = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const isEditing = questionId !== null

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [number, setNumber] = useState('')
  const [text, setText] = useState('')
  const [explanation, setExplanation] = useState('')
  const [category, setCategory] = useState<number>(defaultCategory || categories[0]?.id || 0)
  const [image, setImage] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([emptyAnswer(), emptyAnswer()])

  useEffect(() => {
    if (isEditing) {
      setLoading(true)
      api.get<QuestionDetail>(`/admin/tests/questions/${questionId}/`)
        .then(({ data }) => {
          setNumber(String(data.number))
          setText(data.text)
          setExplanation(data.explanation || '')
          setCategory(data.category)
          setImage(data.image)
          setAnswers(data.answers.length > 0 ? data.answers : [emptyAnswer(), emptyAnswer()])
        })
        .catch(() => toast.add('Помилка завантаження питання', 'error'))
        .finally(() => setLoading(false))
    }
  }, [questionId])

  const updateAnswer = (index: number, field: keyof Answer, value: string | boolean) => {
    setAnswers(prev => prev.map((a, i) => i === index ? { ...a, [field]: value } : a))
  }

  const setCorrect = (index: number) => {
    setAnswers(prev => prev.map((a, i) => ({ ...a, is_correct: i === index })))
  }

  const addAnswer = () => {
    if (answers.length >= 6) return
    setAnswers(prev => [...prev, emptyAnswer()])
  }

  const removeAnswer = (index: number) => {
    if (answers.length <= 2) return
    setAnswers(prev => prev.filter((_, i) => i !== index))
  }

  const handleImageUpload = async (file: File) => {
    if (!isEditing) {
      const reader = new FileReader()
      reader.onload = () => setImage(reader.result as string)
      reader.readAsDataURL(file)
      return
    }

    setUploading(true)
    try {
      const form = new FormData()
      form.append('image', file)
      const { data } = await api.post(`/admin/tests/questions/${questionId}/image/`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setImage(data.image)
      toast.add('Зображення завантажено', 'success')
    } catch {
      toast.add('Помилка завантаження зображення', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    if (isEditing) {
      try {
        await api.delete(`/admin/tests/questions/${questionId}/image/`)
      } catch {
        toast.add('Помилка видалення зображення', 'error')
        return
      }
    }
    setImage(null)
  }

  const handleSave = async () => {
    if (!text.trim()) {
      toast.add('Введіть текст питання', 'error')
      return
    }
    if (!category) {
      toast.add('Оберіть категорію', 'error')
      return
    }
    const validAnswers = answers.filter(a => a.text.trim())
    if (validAnswers.length < 2) {
      toast.add('Потрібно мінімум 2 варіанти відповіді', 'error')
      return
    }
    if (!validAnswers.some(a => a.is_correct)) {
      toast.add('Оберіть правильну відповідь', 'error')
      return
    }

    setSaving(true)
    try {
      const payload = {
        number: number ? parseInt(number) : undefined,
        text,
        explanation: explanation || null,
        category,
        image: isEditing ? undefined : null,
        answers: validAnswers.map((a, i) => ({
          ...(a.id ? { id: a.id } : {}),
          text: a.text,
          is_correct: a.is_correct,
          order: i,
        })),
      }

      if (isEditing) {
        await api.put(`/admin/tests/questions/${questionId}/`, payload)
        toast.add('Питання оновлено', 'success')
      } else {
        const { data } = await api.post('/admin/tests/questions/create/', payload)
        // upload image for new question
        if (image && image.startsWith('data:')) {
          const blob = await fetch(image).then(r => r.blob())
          const form = new FormData()
          form.append('image', blob, 'image.jpg')
          await api.post(`/admin/tests/questions/${data.id}/image/`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        }
        toast.add('Питання створено', 'success')
      }
      onSaved()
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Помилка збереження'
      toast.add(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl max-h-[90vh]">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3" onClick={onClose}>
          <X className="w-4 h-4" />
        </button>

        <h3 className="font-bold text-lg mb-4">
          {isEditing ? 'Редагувати питання' : 'Нове питання'}
        </h3>

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Number + Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label"><span className="label-text text-sm">Номер питання</span></label>
                <input
                  type="number"
                  className="input input-bordered input-sm w-full"
                  value={number}
                  onChange={e => setNumber(e.target.value)}
                  placeholder="Авто"
                />
              </div>
              <div>
                <label className="label"><span className="label-text text-sm">Категорія</span></label>
                <select
                  className="select select-bordered select-sm w-full"
                  value={category}
                  onChange={e => setCategory(Number(e.target.value))}
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Question text */}
            <div>
              <label className="label"><span className="label-text text-sm">Текст питання</span></label>
              <textarea
                className="textarea textarea-bordered w-full text-sm"
                rows={3}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Введіть текст питання..."
              />
            </div>

            {/* Image */}
            <div>
              <label className="label"><span className="label-text text-sm">Зображення</span></label>
              {image ? (
                <div className="relative inline-block">
                  <img
                    src={image}
                    alt="Question"
                    className="max-h-40 rounded-lg border border-base-300"
                  />
                  <button
                    className="btn btn-xs btn-circle btn-error absolute -top-2 -right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  className="btn btn-sm btn-outline gap-2"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  Завантажити зображення
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0]
                  if (f) handleImageUpload(f)
                  e.target.value = ''
                }}
              />
            </div>

            {/* Answers */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label-text text-sm font-medium">Варіанти відповідей</label>
                <button
                  className="btn btn-xs btn-ghost gap-1"
                  onClick={addAnswer}
                  disabled={answers.length >= 6}
                >
                  <Plus className="w-3 h-3" />
                  Додати
                </button>
              </div>
              <div className="space-y-2">
                {answers.map((answer, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <button
                      className={`btn btn-sm btn-circle ${
                        answer.is_correct
                          ? 'btn-success text-success-content'
                          : 'btn-ghost border-base-300'
                      }`}
                      onClick={() => setCorrect(i)}
                      title={answer.is_correct ? 'Правильна' : 'Натисніть для позначення правильної'}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="text"
                      className={`input input-bordered input-sm flex-1 ${
                        answer.is_correct ? 'border-success/50' : ''
                      }`}
                      value={answer.text}
                      onChange={e => updateAnswer(i, 'text', e.target.value)}
                      placeholder={`Варіант ${i + 1}`}
                    />
                    <button
                      className="btn btn-ghost btn-xs btn-square text-error"
                      onClick={() => removeAnswer(i)}
                      disabled={answers.length <= 2}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Explanation */}
            <div>
              <label className="label"><span className="label-text text-sm">Пояснення (необов'язково)</span></label>
              <textarea
                className="textarea textarea-bordered w-full text-sm"
                rows={2}
                value={explanation}
                onChange={e => setExplanation(e.target.value)}
                placeholder="Пояснення до правильної відповіді..."
              />
            </div>

            {/* Actions */}
            <div className="modal-action">
              <button className="btn btn-sm btn-ghost" onClick={onClose}>Скасувати</button>
              <button
                className="btn btn-sm btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving && <span className="loading loading-spinner loading-xs" />}
                {isEditing ? 'Зберегти' : 'Створити'}
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  )
}
