import type { IssuePriority, IssueStatus, IssueType, ProjectStatus, Role } from '../types'

export const ROLE_OPTIONS: Role[] = ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER', 'QA']
export const PROJECT_STATUS_OPTIONS: ProjectStatus[] = ['ACTIVE', 'ARCHIVED', 'ON_HOLD']
export const ISSUE_TYPE_OPTIONS: IssueType[] = ['EPIC', 'STORY', 'TASK', 'BUG']
export const ISSUE_STATUS_OPTIONS: IssueStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']
export const ISSUE_PRIORITY_OPTIONS: IssuePriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

export function roleLabel(role: Role) {
  return role.replace('_', ' ')
}

export function statusLabel(status: string) {
  return status.replace('_', ' ')
}