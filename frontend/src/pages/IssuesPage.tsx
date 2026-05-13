import { useEffect, useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from 'react'
import { issuesApi } from '../api/issuesApi'
import { projectsApi } from '../api/projectsApi'
import { usersApi } from '../api/usersApi'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { IssueDetailsModal } from '../components/IssueDetailsModal'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { Modal } from '../components/Modal'
import { Select } from '../components/Select'
import { Table } from '../components/Table'
import { useAuth } from '../hooks/useAuth'
import type { Issue, IssuePriority, IssueStatus, IssueType, Project, User } from '../types'
import { ISSUE_PRIORITY_OPTIONS, ISSUE_STATUS_OPTIONS, ISSUE_TYPE_OPTIONS, statusLabel } from '../utils/constants'

interface IssueFormState {
  title: string
  description: string
  projectId: number | null
  type: IssueType
  priority: IssuePriority
  assigneeId: number | null
  dueDate: string
}

const defaultForm: IssueFormState = {
  title: '',
  description: '',
  projectId: null,
  type: 'TASK',
  priority: 'MEDIUM',
  assigneeId: null,
  dueDate: '',
}

export function IssuesPage() {
  const { user } = useAuth()
  const [issues, setIssues] = useState<Issue[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const [projectId, setProjectId] = useState<number | undefined>(undefined)
  const [status, setStatus] = useState<IssueStatus | undefined>(undefined)
  const [priority, setPriority] = useState<IssuePriority | undefined>(undefined)
  const [type, setType] = useState<IssueType | undefined>(undefined)

  const [createOpen, setCreateOpen] = useState(false)
  const [editIssue, setEditIssue] = useState<Issue | null>(null)
  const [detailIssueId, setDetailIssueId] = useState<number | null>(null)
  const [deleteIssueId, setDeleteIssueId] = useState<number | null>(null)
  const [form, setForm] = useState<IssueFormState>(defaultForm)
  const [error, setError] = useState('')

  const canDeleteIssue = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER'

  const assigneeOptions = useMemo(
    () => users.map((candidate) => ({ label: `${candidate.fullName} (${candidate.role.replace('_', ' ')})`, value: candidate.id })),
    [users],
  )

  async function loadBaseData() {
    const [projectResponse] = await Promise.all([projectsApi.list({ page: 0, size: 100 })])
    setProjects(projectResponse.content)

    try {
      const usersResponse = await usersApi.list({ page: 0, size: 100, active: true })
      setUsers(usersResponse.content)
    } catch {
      setUsers([])
    }
  }

  async function loadIssues() {
    setLoading(true)
    try {
      const response = await issuesApi.list({
        projectId,
        status,
        priority,
        type,
        page: 0,
        size: 200,
      })
      setIssues(response.content)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBaseData()
  }, [])

  useEffect(() => {
    loadIssues()
  }, [projectId, status, priority, type])

  function openCreateModal() {
    setError('')
    setForm({
      ...defaultForm,
      projectId: projectId ?? projects[0]?.id ?? null,
    })
    setCreateOpen(true)
  }

  function openEditModal(issue: Issue) {
    setError('')
    setEditIssue(issue)
    setForm({
      title: issue.title,
      description: issue.description ?? '',
      projectId: issue.projectId,
      type: issue.type,
      priority: issue.priority,
      assigneeId: issue.assignee?.id ?? null,
      dueDate: issue.dueDate ? issue.dueDate.slice(0, 16) : '',
    })
  }

  async function handleCreateIssue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.title.trim() || !form.projectId) {
      setError('Title and project are required.')
      return
    }

    try {
      await issuesApi.create({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        type: form.type,
        priority: form.priority,
        projectId: form.projectId,
        assigneeId: form.assigneeId ?? undefined,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
      })
      setCreateOpen(false)
      await loadIssues()
    } catch (submitError: any) {
      setError(submitError.response?.data?.message ?? 'Unable to create issue.')
    }
  }

  async function handleUpdateIssue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editIssue) return

    try {
      await issuesApi.update(editIssue.id, {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        priority: form.priority,
        assigneeId: form.assigneeId ?? undefined,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
      })
      setEditIssue(null)
      await loadIssues()
    } catch (submitError: any) {
      setError(submitError.response?.data?.message ?? 'Unable to update issue.')
    }
  }

  async function handleDeleteIssue() {
    if (!deleteIssueId) return
    await issuesApi.remove(deleteIssueId)
    setDeleteIssueId(null)
    await loadIssues()
  }

  return (
    <div className="space-y-4">
      <Card
        title="Issues"
        action={
          <Button onClick={openCreateModal}>
            Create Issue
          </Button>
        }
      >
        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <Select
            label="Project"
            value={projectId ?? ''}
            options={[
              { label: 'All projects', value: '' },
              ...projects.map((project) => ({ label: `${project.projectKey} - ${project.name}`, value: project.id })),
            ]}
            onChange={(event) => setProjectId(event.target.value ? Number(event.target.value) : undefined)}
          />
          <Select
            label="Status"
            value={status ?? ''}
            options={[{ label: 'All statuses', value: '' }, ...ISSUE_STATUS_OPTIONS.map((item) => ({ label: statusLabel(item), value: item }))]}
            onChange={(event) => setStatus((event.target.value as IssueStatus) || undefined)}
          />
          <Select
            label="Priority"
            value={priority ?? ''}
            options={[{ label: 'All priorities', value: '' }, ...ISSUE_PRIORITY_OPTIONS.map((item) => ({ label: item, value: item }))]}
            onChange={(event) => setPriority((event.target.value as IssuePriority) || undefined)}
          />
          <Select
            label="Type"
            value={type ?? ''}
            options={[{ label: 'All types', value: '' }, ...ISSUE_TYPE_OPTIONS.map((item) => ({ label: item, value: item }))]}
            onChange={(event) => setType((event.target.value as IssueType) || undefined)}
          />
        </div>

        {loading ? (
          <LoadingSpinner label="Loading issues..." />
        ) : (
          <Table
            rows={issues}
            rowKey={(issue) => issue.id}
            columns={[
              {
                key: 'key',
                header: 'Issue',
                render: (issue) => (
                  <button className="font-semibold text-mintBrand-700 hover:underline dark:text-mintBrand-300" onClick={() => setDetailIssueId(issue.id)}>
                    {issue.issueKey}
                  </button>
                ),
              },
              { key: 'title', header: 'Title', render: (issue) => issue.title },
              { key: 'project', header: 'Project', render: (issue) => projects.find((project) => project.id === issue.projectId)?.projectKey ?? issue.projectId },
              { key: 'type', header: 'Type', render: (issue) => <Badge tone="info">{issue.type}</Badge> },
              {
                key: 'priority',
                header: 'Priority',
                render: (issue) => (
                  <Badge tone={issue.priority === 'CRITICAL' || issue.priority === 'HIGH' ? 'danger' : issue.priority === 'MEDIUM' ? 'warning' : 'neutral'}>
                    {issue.priority}
                  </Badge>
                ),
              },
              { key: 'status', header: 'Status', render: (issue) => statusLabel(issue.status) },
              { key: 'assignee', header: 'Assignee', render: (issue) => issue.assignee?.fullName ?? '-' },
              {
                key: 'actions',
                header: 'Actions',
                render: (issue) => (
                  <div className="flex gap-2">
                    <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => openEditModal(issue)}>
                      Edit
                    </Button>
                    {canDeleteIssue ? (
                      <Button variant="ghost" className="px-2 py-1 text-xs text-red-600" onClick={() => setDeleteIssueId(issue.id)}>
                        Delete
                      </Button>
                    ) : null}
                  </div>
                ),
              },
            ]}
          />
        )}
      </Card>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Issue">
        <IssueForm
          error={error}
          form={form}
          setForm={setForm}
          users={assigneeOptions}
          projects={projects}
          onSubmit={handleCreateIssue}
          submitLabel="Create"
        />
      </Modal>

      <Modal open={Boolean(editIssue)} onClose={() => setEditIssue(null)} title={editIssue ? `Edit ${editIssue.issueKey}` : 'Edit Issue'}>
        <IssueForm
          error={error}
          form={form}
          setForm={setForm}
          users={assigneeOptions}
          projects={projects}
          onSubmit={handleUpdateIssue}
          submitLabel="Save Changes"
          disableProject
          disableType
        />
      </Modal>

      <IssueDetailsModal
        issueId={detailIssueId}
        onClose={() => setDetailIssueId(null)}
        onIssueUpdated={(updatedIssue) => {
          setIssues((prev) => prev.map((issue) => (issue.id === updatedIssue.id ? updatedIssue : issue)))
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteIssueId)}
        title="Delete issue"
        description="This will permanently remove the issue and its comments. Continue?"
        confirmLabel="Delete"
        onCancel={() => setDeleteIssueId(null)}
        onConfirm={handleDeleteIssue}
      />
    </div>
  )
}

function IssueForm({
  form,
  setForm,
  users,
  projects,
  error,
  onSubmit,
  submitLabel,
  disableProject,
  disableType,
}: {
  form: IssueFormState
  setForm: Dispatch<SetStateAction<IssueFormState>>
  users: Array<{ label: string; value: number }>
  projects: Project[]
  error: string
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  submitLabel: string
  disableProject?: boolean
  disableType?: boolean
}) {
  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <label className="flex flex-col gap-1.5 text-sm text-slateBrand-700 dark:text-slateBrand-200">
        <span className="font-medium">Title</span>
        <input
          value={form.title}
          onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          className="rounded-xl border border-slateBrand-200 bg-white px-3 py-2 text-slateBrand-900 outline-none focus:border-mintBrand-500 dark:border-slateBrand-700 dark:bg-slateBrand-800 dark:text-slateBrand-100"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm text-slateBrand-700 dark:text-slateBrand-200">
        <span className="font-medium">Description</span>
        <textarea
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          className="min-h-24 rounded-xl border border-slateBrand-200 bg-white px-3 py-2 text-slateBrand-900 outline-none focus:border-mintBrand-500 dark:border-slateBrand-700 dark:bg-slateBrand-800 dark:text-slateBrand-100"
        />
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        <Select
          label="Project"
          value={form.projectId ?? ''}
          disabled={disableProject}
          options={projects.map((project) => ({ label: `${project.projectKey} - ${project.name}`, value: project.id }))}
          onChange={(event) => setForm((prev) => ({ ...prev, projectId: Number(event.target.value) || null }))}
        />
        <Select
          label="Type"
          value={form.type}
          disabled={disableType}
          options={ISSUE_TYPE_OPTIONS.map((item) => ({ label: item, value: item }))}
          onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as IssueType }))}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Select
          label="Priority"
          value={form.priority}
          options={ISSUE_PRIORITY_OPTIONS.map((item) => ({ label: item, value: item }))}
          onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value as IssuePriority }))}
        />
        <Select
          label="Assignee"
          value={form.assigneeId ?? ''}
          options={[{ label: 'Unassigned', value: '' }, ...users]}
          onChange={(event) => setForm((prev) => ({ ...prev, assigneeId: Number(event.target.value) || null }))}
        />
      </div>

      <label className="flex flex-col gap-1.5 text-sm text-slateBrand-700 dark:text-slateBrand-200">
        <span className="font-medium">Due Date</span>
        <input
          type="datetime-local"
          value={form.dueDate}
          onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))}
          className="rounded-xl border border-slateBrand-200 bg-white px-3 py-2 text-slateBrand-900 outline-none focus:border-mintBrand-500 dark:border-slateBrand-700 dark:bg-slateBrand-800 dark:text-slateBrand-100"
        />
      </label>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <div className="flex justify-end gap-2">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  )
}
