export type Role = 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER' | 'QA'

export type ProjectStatus = 'ACTIVE' | 'ARCHIVED' | 'ON_HOLD'

export type IssueType = 'EPIC' | 'STORY' | 'TASK' | 'BUG'

export type IssueStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE'

export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface User {
  id: number
  email: string
  fullName: string
  role: Role
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  token: string
  userId: number
  email: string
  fullName: string
  role: Role
}

export interface Project {
  id: number
  projectKey: string
  name: string
  description?: string
  status: ProjectStatus
  lead: User
  members: User[]
  createdAt: string
  updatedAt: string
}

export interface Issue {
  id: number
  issueKey: string
  title: string
  description?: string
  type: IssueType
  status: IssueStatus
  priority: IssuePriority
  projectId: number
  reporter: User
  assignee?: User | null
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: number
  issueId: number
  author: User
  content: string
  createdAt: string
}

export interface ActivityLog {
  id: number
  user?: User
  action: string
  entityType: string
  entityId?: number
  description?: string
  createdAt: string
}

export interface DashboardStats {
  totalProjects: number
  totalIssues: number
  issuesByStatus: Record<IssueStatus, number>
  myIssuesCount: number
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface ApiMessage {
  message: string
}