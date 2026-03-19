import { z } from 'zod'

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Введіть логін або email'),
  password: z
    .string()
    .min(1, 'Введіть пароль'),
})

export const registerSchema = z.object({
  first_name: z
    .string()
    .min(2, 'Мінімум 2 символи')
    .max(50, 'Максимум 50 символів'),
  last_name: z
    .string()
    .min(2, 'Мінімум 2 символи')
    .max(50, 'Максимум 50 символів'),
  username: z
    .string()
    .min(3, 'Мінімум 3 символи')
    .max(30, 'Максимум 30 символів')
    .regex(/^[a-zA-Z0-9_]+$/, 'Тільки латиниця, цифри та _'),
  email: z
    .string()
    .email('Невірний формат email'),
  phone: z
    .string()
    .regex(/^\+380\d{9}$/, 'Формат: +380XXXXXXXXX'),
  password: z
    .string()
    .min(8, 'Мінімум 8 символів'),
  password_confirm: z
    .string()
    .min(1, 'Підтвердіть пароль'),
}).refine((data) => data.password === data.password_confirm, {
  message: 'Паролі не співпадають',
  path: ['password_confirm'],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
