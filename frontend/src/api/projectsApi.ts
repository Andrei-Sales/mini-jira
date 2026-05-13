import { apiClient } from './axios'
import type { PageResponse, Project, ProjectStatus } from '../types'

export interface ProjectQuery {
  page?: number
  size?: number
}

export interface CreateProjectPayload {
  projectKey: string
  name: string
  description?: string
  leadId?: number
}

export interface UpdateProjectPayload {
  name?: string
  description?: string
  status?: ProjectStatus
  leadId?: number
}

export const projectsApi = {
  async list(params: ProjectQuery) {
    const { data } = await apiClient.get<PageResponse<Project>>('/projects', { params })
    return data
  },

  async getById(id: number) {
    const { data } = await apiClient.get<Project>(`/projects/${id}`)
    return data
  },

  async create(payload: CreateProjectPayload) {
    const { data } = await apiClient.post<Project>('/projects', payload)
    return data
  },

  async update(id: number, payload: UpdateProjectPayload) {
    const { data } = await apiClient.put<Project>(`/projects/${id}`, payload)
    return data
  },

  async remove(id: number) {
    await apiClient.delete(`/projects/${id}`)
  },

  async assignMembers(id: number, memberIds: number[]) {
    const { data } = await apiClient.post<Project>(`/projects/${id}/members`, { memberIds })
    return data
  },

  async removeMember(id: number, memberId: number) {
    const { data } = await apiClient.delete<Project>(`/projects/${id}/members/${memberId}`)
    return data
  },
}