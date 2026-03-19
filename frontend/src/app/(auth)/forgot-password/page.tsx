'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const schema = z.object({
  email: z.string().email('Введіть коректний email'),
})

type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      // TODO: api.post('/auth/password/reset/', data)
      await new Promise((r) => setTimeout(r, 1000))
      setSubmittedEmail(data.email)
      setSent(true)
    } catch {
      // handle error
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Перевірте пошту</h2>
        <p className="text-base-content/60 mb-6 leading-relaxed">
          Ми надіслали інструкцію для відновлення пароля на{' '}
          <span className="font-medium text-base-content">{submittedEmail}</span>
        </p>
        <p className="text-sm text-base-content/50 mb-8">
          Не отримали лист? Перевірте папку «Спам» або спробуйте ще раз через кілька хвилин.
        </p>
        <Link href="/login" className="btn btn-primary btn-sm">
          Повернутися до входу
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-sm text-base-content/60 hover:text-base-content mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад до входу
      </Link>

      <h2 className="text-2xl sm:text-3xl font-bold mb-2">Відновлення пароля</h2>
      <p className="text-base-content/60 mb-8">
        Введіть email, вказаний при реєстрації. Ми надішлемо посилання для зміни пароля.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="student@gmail.com"
          autoComplete="email"
          inputMode="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <Button type="submit" fullWidth loading={loading}>
          <Mail className="w-4 h-4" />
          Надіслати посилання
        </Button>
      </form>
    </div>
  )
}
