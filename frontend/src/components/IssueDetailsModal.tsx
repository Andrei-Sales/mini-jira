import { useEffect, useMemo, useState } from 'react'
import { commentsApi } from '../api/commentsApi'
import { issuesApi } from '../api/issuesApi'
import type { Comment, Issue, IssueStatus } from '../types'
import { formatDateTime, initials } from '../utils/date'
import { ISSUE_STATUS_OPTIONS, statusLabel } from '../utils/constants'
import { Badge } from './Badge'
import { Button } from './Button'
import { LoadingSpinner } from './LoadingSpinner'
import { Modal } from './Modal'
import { Select } from './Select'
import { useAuth } from '../hooks/useAuth'

interface IssueDetailsModalProps {
  issueId: number | null
  onClose: () => void
  onIssueUpdated?: (issue: Issue) => void
}

function priorityTone(priority: Issue['priority']): 'danger' | 'warning' | 'neutral' {
  if (priority === 'CRITICAL' || priority === 'HIGH') return 'danger'
  if (priority === 'MEDIUM') return 'warning'
  return 'neutral'
}

export function IssueDetailsModal({ issueId, onClose, onIssueUpdated }: IssueDetailsModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [issue, setIssue] = useState<Issue | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentInput, setCommentInput] = useState('')
  const [savingComment, setSavingComment] = useState(false)

  useEffect(() => {
    if (!issueId) return
    const currentIssueId = issueId

    async function load() {
      setLoading(true)
      try {
        const [issueData, commentPage] = await Promise.all([
          issuesApi.getById(currentIssueId),
          commentsApi.list(currentIssueId, 0, 50),
        ])
        setIssue(issueData)
        setComments(commentPage.content)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [issueId])

  const canDeleteComment = useMemo(() => {
    if (!user) return false
    return user.role === 'ADMIN'
  }, [user])

  if (!issueId) return null

  async function handleStatusChange(status: IssueStatus) {
    if (!issue) return
    const updated = await issuesApi.updateStatus(issue.id, status)
    setIssue(updated)
    onIssueUpdated?.(updated)
  }

  async function handleAddComment() {
    if (!issue || !commentInput.trim()) return
    setSavingComment(true)
    try {
      await commentsApi.create(issue.id, commentInput.trim())
      const nextComments = await commentsApi.list(issue.id, 0, 50)
      setComments(nextComments.content)
      setCommentInput('')
    } finally {
      setSavingComment(false)
    }
  }

  async function handleDeleteComment(comment: Comment) {
    if (!issue) return
    await commentsApi.remove(issue.id, comment.id)
    setComments((prev) => prev.filter((item) => item.id !== comment.id))
  }

  return (
    <Modal open={Boolean(issueId)} title={issue?.issueKey ?? 'Issue details'} onClose={onClose}>
      {loading || !issue ? (
        <LoadingSpinner label="Loading issue details..." />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={priorityTone(issue.priority)}>{issue.priority}</Badge>
            <Badge tone="info">{issue.type}</Badge>
            <Badge tone="neutral">{statusLabel(issue.status)}</Badge>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold text-slateBrand-900 dark:text-slateBrand-50">{issue.title}</h3>
            <p className="mt-1 text-sm text-slateBrand-600 dark:text-slateBrand-300">{issue.description || 'No description provided.'}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slateBrand-200 p-3 text-sm dark:border-slateBrand-700">
              <p className="font-semibold text-slateBrand-700 dark:text-slateBrand-100">Reporter</p>
              <p className="mt-1 text-slateBrand-600 dark:text-slateBrand-300">{issue.reporter.fullName}</p>
            </div>
            <div className="rounded-xl border border-slateBrand-200 p-3 text-sm dark:border-slateBrand-700">
              <p className="font-semibold text-slateBrand-700 dark:text-slateBrand-100">Assignee</p>
              <p className="mt-1 text-slateBrand-600 dark:text-slateBrand-300">{issue.assignee?.fullName ?? 'Unassigned'}</p>
            </div>
          </div>

          <Select
            label="Status"
            value={issue.status}
            options={ISSUE_STATUS_OPTIONS.map((status) => ({ label: statusLabel(status), value: status }))}
            onChange={(event) => handleStatusChange(event.target.value as IssueStatus)}
          />

          <section>
            <h4 className="mb-2 text-sm font-semibold text-slateBrand-700 dark:text-slateBrand-100">Comments</h4>
            <div className="space-y-2">
              {comments.map((comment) => {
                const canDelete = canDeleteComment || comment.author.id === user?.id
                return (
                  <article key={comment.id} className="rounded-xl border border-slateBrand-200 p-3 text-sm dark:border-slateBrand-700">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slateBrand-100 text-xs font-bold text-slateBrand-700 dark:bg-slateBrand-700 dark:text-slateBrand-100">
                          {initials(comment.author.fullName)}
                        </span>
                        <div>
                          <p className="font-semibold text-slateBrand-800 dark:text-slateBrand-100">{comment.author.fullName}</p>
                          <p className="text-xs text-slateBrand-500">{formatDateTime(comment.createdAt)}</p>
                        </div>
                      </div>
                      {canDelete ? (
                        <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => handleDeleteComment(comment)}>
                          Delete
                        </Button>
                      ) : null}
                    </div>
                    <p className="text-slateBrand-700 dark:text-slateBrand-200">{comment.content}</p>
                  </article>
                )
              })}
              {comments.length === 0 ? (
                <p className="text-sm text-slateBrand-500">No comments yet.</p>
              ) : null}
            </div>
            <div className="mt-3 flex gap-2">
              <textarea
                value={commentInput}
                onChange={(event) => setCommentInput(event.target.value)}
                placeholder="Write a comment..."
                className="min-h-24 flex-1 rounded-xl border border-slateBrand-200 bg-white px-3 py-2 text-sm text-slateBrand-900 outline-none focus:border-mintBrand-500 dark:border-slateBrand-700 dark:bg-slateBrand-800 dark:text-slateBrand-100"
              />
              <Button className="self-end" loading={savingComment} onClick={handleAddComment}>
                Add
              </Button>
            </div>
          </section>
        </div>
      )}
    </Modal>
  )
}
