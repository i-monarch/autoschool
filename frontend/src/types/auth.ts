export interface User {
  id: number
  username: string
  email: string
  phone: string | null
  first_name: string
  last_name: string
  role: 'student' | 'teacher' | 'admin'
  avatar: string | null
  language: string
  is_phone_verified: boolean
  is_paid: boolean
  paid_until: string | null
  access_type: 'free' | 'trial' | 'paid'
  created_at: string
}

export interface LoginData {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  phone: string
  password: string
  password_confirm: string
  first_name: string
  last_name: string
}

export interface ApiError {
  error: string
  message: string
  details: Record<string, string[]>
}
