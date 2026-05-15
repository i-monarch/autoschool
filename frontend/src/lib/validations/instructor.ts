import { z } from 'zod'

const nullablePositiveInteger = z.preprocess((value) => {
  if (value === '' || value === null || typeof value === 'undefined') return null
  const numeric = Number(value)
  return Number.isNaN(numeric) ? value : numeric
}, z.number().int('Вкажіть ціле число').positive('Вкажіть ціну більше 0').nullable())

export const instructorProfileSchema = z.object({
  car_model: z.string().max(100, 'Максимум 100 символів'),
  description: z.string().max(2000, 'Максимум 2000 символів'),
  price_per_hour: nullablePositiveInteger,
})

export const instructorDocumentsSchema = z.object({
  vin_code: z.string().max(17, 'Максимум 17 символів'),
  is_official: z.boolean(),
  is_car_equipped: z.boolean(),
})

export type InstructorProfileFormData = z.infer<typeof instructorProfileSchema>
export type InstructorDocumentsFormData = z.infer<typeof instructorDocumentsSchema>
