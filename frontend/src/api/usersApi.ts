import { apiClient } from './axios'
import type { PageResponse, Role, User } from '../types'

export interface UserQuery {
  page?: number
  size?: number
  search?: string
  active?: boolean
}

export interface CreateUserPayload {
  email: string
  fullName: string
  password: string
  role: Role
}

export interface UpdateUserPayload {
  email?: string
  fullName?: string
  role?: Role
  active?: boolean
}

export const usersApi = {
  async list(params: UserQuery) {
    const { data } = await apiClient.get<PageResponse<User>>('/users', { params })
    return data
  },

  async create(payload: CreateUserPayload) {
    const { data } = await apiClient.post<User>('/users', payload)
    return data
  },

  async update(id: number, payload: UpdateUserPayload) {
    const { data } = await apiClient.put<User>(`/users/${id}`, payload)
    return data
  },

  async updateRole(id: number, role: Role) {
    const { data } = await apiClient.patch<User>(`/users/${id}/role`, { role })
    return data
  },

  async deactivate(id: number) {
    await apiClient.patch(`/users/${id}/deactivate`)
  },

  async memberCandidates(search?: string) {
    const { data } = await apiClient.get<PageResponse<User>>('/projects/member-candidates', {
      params: { page: 0, size: 100, search: search || undefined },
    })
    return data
  },
}
