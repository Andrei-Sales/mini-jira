import { apiClient } from './axios'
import type { AuthResponse, User } from '../types'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  fullName: string
  password: string
}

export const authApi = {
  async login(payload: LoginPayload) {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', payload)
    return data
  },

  async register(payload: RegisterPayload) {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', payload)
    return data
  },

  async logout() {
    await apiClient.post('/auth/logout')
  },

  async profile() {
    const { data } = await apiClient.get<User>('/profile')
    return data
  },

  async updateProfile(fullName: string) {
    const { data } = await apiClient.put<User>('/profile', { fullName })
    return data
  },
}
