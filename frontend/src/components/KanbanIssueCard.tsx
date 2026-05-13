import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import type { Issue } from '../types'
import { Badge } from './Badge'
import { initials } from '../utils/date'

interface KanbanIssueCardProps {
  issue: Issue
  onOpen: (issueId: number) => void
}

function priorityTone(priority: Issue['priority']): 'danger' | 'warning' | 'neutral' {
  if (priority === 'CRITICAL' || priority === 'HIGH') return 'danger'
  if (priority === 'MEDIUM') return 'warning'
  return 'neutral'
}

function typeTone(type: Issue['type']): 'info' | 'success' | 'warning' | 'neutral' {
  switch (type) {
    case 'BUG':
      return 'warning'
    case 'EPIC':
      return 'info'
    case 'STORY':
      return 'success'
    default:
      return 'neutral'
  }
}

export function KanbanIssueCard({ issue, onOpen }: KanbanIssueCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: issue.id })

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
      className={`cursor-grab rounded-xl border border-slateBrand-200 bg-white p-3 shadow-sm dark:border-slateBrand-700 dark:bg-slateBrand-800 ${
        isDragging ? 'opacity-60' : 'opacity-100'
      }`}
      onClick={() => onOpen(issue.id)}
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slateBrand-500">{issue.issueKey}</p>
        <Badge tone={priorityTone(issue.priority)}>{issue.priority}</Badge>
      </div>
      <p className="mb-3 text-sm font-semibold text-slateBrand-800 dark:text-slateBrand-100">{issue.title}</p>
      <div className="flex items-center justify-between">
        <Badge tone={typeTone(issue.type)}>{issue.type}</Badge>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slateBrand-100 text-xs font-bold text-slateBrand-700 dark:bg-slateBrand-700 dark:text-slateBrand-100">
          {initials(issue.assignee?.fullName ?? issue.reporter.fullName)}
        </span>
      </div>
    </article>
  )
}