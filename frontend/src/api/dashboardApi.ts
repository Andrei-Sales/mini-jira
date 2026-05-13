import { apiClient } from './axios'
import type { ActivityLog, DashboardStats } from '../types'

export const dashboardApi = {
  async stats() {
    const { data } = await apiClient.get<DashboardStats>('/dashboard/stats')
    return data
  },

  async activity() {
    const { data } = await apiClient.get<ActivityLog[]>('/dashboard/activity')
    return data
  },
}