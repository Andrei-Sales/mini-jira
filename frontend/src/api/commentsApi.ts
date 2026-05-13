import { apiClient } from './axios'
import type { Comment, PageResponse } from '../types'

export const commentsApi = {
  async list(issueId: number, page = 0, size = 20) {
    const { data } = await apiClient.get<PageResponse<Comment>>(`/issues/${issueId}/comments`, {
      params: { page, size },
    })
    return data
  },

  async create(issueId: number, content: string) {
    const { data } = await apiClient.post<Comment>(`/issues/${issueId}/comments`, { content })
    return data
  },

  async remove(issueId: number, commentId: number) {
    await apiClient.delete(`/issues/${issueId}/comments/${commentId}`)
  },
}