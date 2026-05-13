import { apiClient } from './axios'
import type { Issue, IssuePriority, IssueStatus, IssueType, PageResponse } from '../types'

export interface IssueQuery {
  projectId?: number
  assigneeId?: number
  status?: IssueStatus
  priority?: IssuePriority
  type?: IssueType
  page?: number
  size?: number
}

export interface CreateIssuePayload {
  title: string
  description?: string
  type: IssueType
  priority: IssuePriority
  projectId: number
  assigneeId?: number
  dueDate?: string
}

export interface UpdateIssuePayload {
  title?: string
  description?: string
  status?: IssueStatus
  priority?: IssuePriority
  assigneeId?: number
  dueDate?: string
}

export const issuesApi = {
  async list(params: IssueQuery) {
    const { data } = await apiClient.get<PageResponse<Issue>>('/issues', { params })
    return data
  },

  async getById(id: number) {
    const { data } = await apiClient.get<Issue>(`/issues/${id}`)
    return data
  },

  async create(payload: CreateIssuePayload) {
    const { data } = await apiClient.post<Issue>('/issues', payload)
    return data
  },

  async update(id: number, payload: UpdateIssuePayload) {
    const { data } = await apiClient.put<Issue>(`/issues/${id}`, payload)
    return data
  },

  async updateStatus(id: number, status: IssueStatus) {
    const { data } = await apiClient.patch<Issue>(`/issues/${id}/status`, { status })
    return data
  },

  async remove(id: number) {
    await apiClient.delete(`/issues/${id}`)
  },
}