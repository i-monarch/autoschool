import api from '@/lib/api'
import type {
  InstructorAdmin,
  InstructorProfile,
  InstructorPublic,
  InstructorStats,
  InstructorSubscription,
  InstructorTariff,
} from '@/types/instructors'

export interface AdminInstructorFilters {
  status?: string
  city?: string
  page?: number
}

export interface PaginatedAdminInstructors {
  count: number
  next: string | null
  previous: string | null
  results: InstructorAdmin[]
}

type InstructorProfilePayload = Partial<InstructorProfile>

interface SubscribeResponse {
  subscription: InstructorSubscription
  payment_url: string | null
}

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('response' in error)) {
    return undefined
  }

  const response = (error as { response?: { status?: number } }).response
  return response?.status
}

export async function getPublicInstructors(citySlug?: string): Promise<InstructorPublic[]> {
  const response = await api.get<InstructorPublic[]>('/instructors/', {
    params: citySlug ? { city: citySlug } : undefined,
  })
  return response.data
}

export async function getAdminInstructors(
  filters: AdminInstructorFilters,
): Promise<PaginatedAdminInstructors> {
  const response = await api.get<PaginatedAdminInstructors>('/admin/instructors/', {
    params: filters,
  })
  return response.data
}

export async function getAdminInstructorStats(): Promise<InstructorStats> {
  const response = await api.get<InstructorStats>('/admin/instructors/stats/')
  return response.data
}

export async function verifyInstructor(id: number): Promise<InstructorAdmin> {
  const response = await api.post<InstructorAdmin>(`/admin/instructors/${id}/verify/`)
  return response.data
}

export async function rejectInstructor(id: number, note: string): Promise<InstructorAdmin> {
  const response = await api.post<InstructorAdmin>(`/admin/instructors/${id}/reject/`, { note })
  return response.data
}

export async function deleteInstructor(id: number): Promise<void> {
  await api.delete(`/admin/instructors/${id}/`)
}

export async function getMyInstructorProfile(): Promise<InstructorProfile | null> {
  try {
    const { data } = await api.get<InstructorProfile>('/instructors/me/')
    return data
  } catch (error: unknown) {
    if (getErrorStatus(error) === 404) return null
    throw error
  }
}

export async function createMyInstructorProfile(
  data: InstructorProfilePayload = {},
): Promise<InstructorProfile> {
  const response = await api.post<InstructorProfile>('/instructors/me/', data)
  return response.data
}

export async function updateMyInstructorProfile(
  data: FormData | InstructorProfilePayload,
): Promise<InstructorProfile> {
  const config = data instanceof FormData
    ? { headers: { 'Content-Type': 'multipart/form-data' } }
    : undefined
  const response = await api.patch<InstructorProfile>('/instructors/me/', data, config)
  return response.data
}

export async function getInstructorTariffs(): Promise<InstructorTariff[]> {
  const response = await api.get<InstructorTariff[]>('/payments/tariffs/', {
    params: { user_type: 'instructor' },
  })
  return response.data
}

export async function getMySubscription(): Promise<InstructorSubscription | null> {
  const response = await api.get<InstructorSubscription | null>('/payments/me/')
  return response.data
}

export async function subscribe(tariffId: number): Promise<SubscribeResponse> {
  const response = await api.post<SubscribeResponse>('/payments/subscribe/', {
    tariff_id: tariffId,
  })
  return response.data
}
