'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, UserPlus, AlertCircle } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useAuthStore } from '@/stores/auth'
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth'

export default function RegisterPage() {
  const router = useRouter()
  const { register: signUp, loading, error, clearError } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const goToStep2 = async () => {
    const valid = await trigger(['first_name', 'last_name', 'phone', 'email'])
    if (valid) setStep(2)
  }

  const onSubmit = async (data: RegisterFormData) => {
    clearError()
    try {
      await signUp(data)
      router.push('/dashboard')
    } catch {
      // error displayed from store
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
      <h2 className="text-2xl sm:text-3xl font-bold mb-2">Реєстрація</h2>
      <p className="text-base-content/60 mb-6">
        {step === 1 ? 'Розкажіть про себе' : 'Придумайте логін та пароль'}
      </p>

      {/* Progress steps */}
      <div className="flex gap-2 mb-8">
        <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-base-300'}`} />
        <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-base-300'}`} />
      </div>

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
        {step === 1 && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Ім'я"
                placeholder="Олександр"
                autoComplete="given-name"
                error={errors.first_name?.message}
                {...register('first_name')}
              />
              <Input
                label="Прізвище"
                placeholder="Шевченко"
                autoComplete="family-name"
                error={errors.last_name?.message}
                {...register('last_name')}
              />
            </div>

            <Input
              label="Телефон"
              type="tel"
              inputMode="tel"
              placeholder="+380XXXXXXXXX"
              autoComplete="tel"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label="Email"
              type="email"
              inputMode="email"
              placeholder="student@gmail.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Button type="button" fullWidth onClick={goToStep2}>
              Далі
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <Input
              label="Логін"
              placeholder="oleksandr_shevchenko"
              autoComplete="username"
              error={errors.username?.message}
              {...register('username')}
            />

            <Input
              label="Пароль"
              type={showPassword ? 'text' : 'password'}
              placeholder="Мінімум 8 символів"
              autoComplete="new-password"
              error={errors.password?.message}
              rightIcon={togglePassword}
              {...register('password')}
            />

            <Input
              label="Підтвердження паролю"
              type={showPassword ? 'text' : 'password'}
              placeholder="Повторіть пароль"
              autoComplete="new-password"
              error={errors.password_confirm?.message}
              rightIcon={togglePassword}
              {...register('password_confirm')}
            />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Назад
              </Button>
              <Button type="submit" fullWidth loading={loading} className="flex-1">
                <UserPlus className="w-4 h-4" />
                Зареєструватися
              </Button>
            </div>
          </>
        )}
      </form>

      <div className="divider my-8">або</div>

      <p className="text-center text-base-content/60">
        Вже є акаунт?{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Увійти
        </Link>
      </p>
    </div>
  )
}
