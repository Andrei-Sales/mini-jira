import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import type { Issue, IssueStatus } from '../types'
import { KanbanIssueCard } from './KanbanIssueCard'

interface KanbanColumnProps {
  status: IssueStatus
  title: string
  issues: Issue[]
  onOpenIssue: (issueId: number) => void
}

const columnColors: Record<IssueStatus, string> = {
  TODO: 'border-slateBrand-200 bg-slateBrand-50/70 dark:border-slateBrand-700 dark:bg-slateBrand-800/60',
  IN_PROGRESS: 'border-sky-200 bg-sky-50 dark:border-sky-700/60 dark:bg-sky-900/20',
  IN_REVIEW: 'border-amber-200 bg-amber-50 dark:border-amber-700/60 dark:bg-amber-900/20',
  DONE: 'border-emerald-200 bg-emerald-50 dark:border-emerald-700/60 dark:bg-emerald-900/20',
}

export function KanbanColumn({ status, title, issues, onOpenIssue }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <section ref={setNodeRef} className={`rounded-2xl border p-3 ${columnColors[status]} ${isOver ? 'ring-2 ring-mintBrand-500' : ''}`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-slateBrand-700 dark:text-slateBrand-100">{title}</h3>
        <span className="rounded-full bg-white/90 px-2 py-1 text-xs font-bold text-slateBrand-600 dark:bg-slateBrand-700 dark:text-slateBrand-50">{issues.length}</span>
      </div>
      <SortableContext items={issues.map((issue) => issue.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-16">
          {issues.map((issue) => (
            <KanbanIssueCard key={issue.id} issue={issue} onOpen={onOpenIssue} />
          ))}
        </div>
      </SortableContext>
    </section>
  )
}
