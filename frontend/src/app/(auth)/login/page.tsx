'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useAuthStore } from '@/stores/auth'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'

export default function LoginPage() {
  const router = useRouter()
  const { login, loading, error, clearError } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    clearError()
    try {
      await login(data)
      const user = useAuthStore.getState().user
      if (user?.role === 'admin') {
        router.push('/admin/dashboard')
      } else if (user?.role === 'teacher') {
        router.push('/teacher/dashboard')
      } else {
        router.push('/dashboard')
      }
    } catch {
      // error is set in store, displayed below
    }
  }

  const togglePassword = (
    <button
      type="button"
      className="text-base-content/40 hover:text-base-content/70 transition-colors"
      onClick={() => setShowPassword(!showPassword)}
      tabIndex={-1}
      aria-label={showPassword ? 'Hide password' : 'Show password'}
    >
      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
    </button>
  )

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-2">Вхід</h2>
      <p className="text-base-content/60 mb-8">
        Введіть дані для входу в особистий кабінет
      </p>

      {error && (
        <div className="alert alert-error mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            className="btn btn-ghost btn-xs btn-circle"
            onClick={clearError}
            aria-label="Close"
          >
            x
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Логін або email"
          placeholder="student"
          autoComplete="username"
          error={errors.username?.message}
          {...register('username')}
        />

        <Input
          label="Пароль"
          type={showPassword ? 'text' : 'password'}
          placeholder="Мінімум 8 символів"
          autoComplete="current-password"
          error={errors.password?.message}
          rightIcon={togglePassword}
          {...register('password')}
        />

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Забули пароль?
          </Link>
        </div>

        <Button type="submit" fullWidth loading={loading}>
          <LogIn className="w-4 h-4" />
          Увійти
        </Button>
      </form>

      <div className="divider my-8">або</div>

      <p className="text-center text-base-content/60">
        Ще немає акаунту?{' '}
        <Link href="/register" className="text-primary font-medium hover:underline">
          Зареєструватися
        </Link>
      </p>
    </div>
  )
}
