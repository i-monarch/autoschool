export interface InstructorPublic {
  id: number
  photo: string
  car_photo: string
  car_model: string
  description: string
  price_per_hour: number | null
  certificate_photo: string
  is_official: boolean
  is_car_equipped: boolean
  first_name: string
  last_name: string
  phone: string | null
  email: string
  city: {
    id: number
    name: string
    slug: string
    region: string
  } | null
  created_at: string
}

export interface InstructorAdmin extends InstructorPublic {
  user_id: number
  vin_code: string
  tech_passport: string
  is_verified: boolean
  verification_note: string
  updated_at: string
}

export interface InstructorStats {
  total: number
  pending: number
  verified: number
  with_active_subscription: number
}

export interface InstructorProfile {
  id: number
  photo: string | null
  car_photo: string | null
  car_model: string
  description: string
  price_per_hour: number | null
  certificate_photo: string | null
  vin_code: string
  tech_passport: string | null
  is_official: boolean
  is_car_equipped: boolean
  is_verified: boolean
  verification_note: string
  created_at: string
  updated_at: string
}

export interface InstructorTariff {
  id: number
  name: string
  description: string
  price: string
  duration_days: number
  user_type: 'student' | 'instructor'
  features: string[]
  is_popular: boolean
}

export interface InstructorSubscription {
  id: number
  tariff: InstructorTariff
  started_at: string
  expires_at: string
  is_active: boolean
  payment_status: 'pending' | 'paid' | 'failed'
  created_at: string
}
