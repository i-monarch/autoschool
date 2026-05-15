import api from '@/lib/api'
import type { City } from '@/types/cities'

export interface AdminCity extends City {
  created_at: string
}

export type CityPayload = Pick<City, 'name' | 'slug' | 'region' | 'is_active' | 'order'>

export async function getCities(): Promise<City[]> {
  const response = await api.get<City[]>('/cities/')
  return response.data
}

export async function getAdminCities(): Promise<AdminCity[]> {
  const response = await api.get<AdminCity[]>('/admin/cities/')
  return response.data
}

export async function createCity(data: CityPayload): Promise<AdminCity> {
  const response = await api.post<AdminCity>('/admin/cities/', data)
  return response.data
}

export async function updateCity(
  id: number,
  data: Partial<CityPayload>,
): Promise<AdminCity> {
  const response = await api.patch<AdminCity>(`/admin/cities/${id}/`, data)
  return response.data
}

export async function deleteCity(id: number): Promise<void> {
  await api.delete(`/admin/cities/${id}/`)
}
