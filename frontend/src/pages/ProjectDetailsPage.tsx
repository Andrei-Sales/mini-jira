import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { issuesApi } from '../api/issuesApi'
import { projectsApi } from '../api/projectsApi'
import { usersApi } from '../api/usersApi'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Input } from '../components/Input'
import { IssueDetailsModal } from '../components/IssueDetailsModal'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { Select } from '../components/Select'
import { Table } from '../components/Table'
import { useAuth } from '../hooks/useAuth'
import type { Issue, Project, User } from '../types'
import { formatDate } from '../utils/date'
import { statusLabel } from '../utils/constants'

export function ProjectDetailsPage() {
  const { user } = useAuth()
  const params = useParams()
  const projectId = Number(params.projectId)

  const [project, setProject] = useState<Project | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [issueModalId, setIssueModalId] = useState<number | null>(null)

  const canManageMembers = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER'

  const availableUsers = useMemo(() => {
    if (!project) return []
    const memberIds = new Set(project.members.map((member) => member.id))
    return users.filter((candidate) => !memberIds.has(candidate.id) && candidate.active)
  }, [project, users])

  async function loadProjectData() {
    setLoading(true)
    try {
      const [projectResponse, issuesResponse] = await Promise.all([
        projectsApi.getById(projectId),
        issuesApi.list({ projectId, page: 0, size: 100 }),
      ])
      setProject(projectResponse)
      setIssues(issuesResponse.content)

      try {
        const usersResponse = await usersApi.memberCandidates()
        setUsers(usersResponse.content)
      } catch {
        setUsers([])
      }
    } catch (loadError: any) {
      setError(loadError.response?.data?.message ?? 'Unable to load project details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!Number.isFinite(projectId) || projectId < 1) return
    loadProjectData()
  }, [projectId])

  async function handleAddMember() {
    if (!selectedUserId || !project) return
    const updatedProject = await projectsApi.assignMembers(project.id, [selectedUserId])
    setProject(updatedProject)
    setSelectedUserId(null)
  }

  async function handleRemoveMember(memberId: number) {
    if (!project) return
    const updatedProject = await projectsApi.removeMember(project.id, memberId)
    setProject(updatedProject)
  }

  if (loading) return <LoadingSpinner label="Loading project details..." />

  if (error) {
    return (
      <Card>
        <p className="text-sm text-red-500">{error}</p>
      </Card>
    )
  }

  if (!project) return null

  return (
    <div className="space-y-4">
      <Card title={`${project.name} (${project.projectKey})`}>
        <p className="text-sm text-slateBrand-600 dark:text-slateBrand-300">{project.description || 'No project description.'}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge tone={project.status === 'ACTIVE' ? 'success' : project.status === 'ON_HOLD' ? 'warning' : 'neutral'}>
            {statusLabel(project.status)}
          </Badge>
          <span className="text-xs text-slateBrand-500">Lead: {project.lead.fullName}</span>
          <span className="text-xs text-slateBrand-500">Created: {formatDate(project.createdAt)}</span>
          <Link to={`/kanban?projectId=${project.id}`} className="text-xs font-semibold text-mintBrand-600 hover:underline">
            Open in Kanban
          </Link>
        </div>
      </Card>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card title="Project Members">
          <div className="space-y-2">
            {project.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between rounded-xl border border-slateBrand-200 px-3 py-2 text-sm dark:border-slateBrand-700">
                <div>
                  <p className="font-semibold text-slateBrand-700 dark:text-slateBrand-100">{member.fullName}</p>
                  <p className="text-xs text-slateBrand-500">{member.role.replace('_', ' ')}</p>
                </div>
                {canManageMembers && member.id !== project.lead.id ? (
                  <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => handleRemoveMember(member.id)}>
                    Remove
                  </Button>
                ) : null}
              </div>
            ))}
          </div>

          {canManageMembers ? (
            <div className="mt-4 flex gap-2">
              <Select
                value={selectedUserId ?? ''}
                onChange={(event) => setSelectedUserId(Number(event.target.value))}
                options={[
                  { label: 'Select user', value: '' },
                  ...availableUsers.map((candidate) => ({
                    label: `${candidate.fullName} (${candidate.role.replace('_', ' ')})`,
                    value: candidate.id,
                  })),
                ]}
              />
              <Button onClick={handleAddMember} disabled={!selectedUserId}>
                Add
              </Button>
            </div>
          ) : (
            <p className="mt-3 text-xs text-slateBrand-500">Only Admin / Project Manager can manage members.</p>
          )}
        </Card>

        <Card title="Create Quick Issue">
          <QuickIssueForm
            projectId={project.id}
            onCreated={async () => {
              const response = await issuesApi.list({ projectId: project.id, page: 0, size: 100 })
              setIssues(response.content)
            }}
          />
        </Card>
      </section>

      <Card title="Project Issues">
        <Table
          rows={issues}
          rowKey={(issue) => issue.id}
          columns={[
            {
              key: 'issueKey',
              header: 'Issue',
              render: (issue) => (
                <button className="font-semibold text-mintBrand-700 hover:underline dark:text-mintBrand-300" onClick={() => setIssueModalId(issue.id)}>
                  {issue.issueKey}
                </button>
              ),
            },
            { key: 'title', header: 'Title', render: (issue) => issue.title },
            { key: 'type', header: 'Type', render: (issue) => <Badge tone="info">{issue.type}</Badge> },
            { key: 'priority', header: 'Priority', render: (issue) => <Badge tone={issue.priority === 'HIGH' || issue.priority === 'CRITICAL' ? 'danger' : 'warning'}>{issue.priority}</Badge> },
            { key: 'status', header: 'Status', render: (issue) => statusLabel(issue.status) },
            { key: 'assignee', header: 'Assignee', render: (issue) => issue.assignee?.fullName ?? '-' },
          ]}
        />
      </Card>

      <IssueDetailsModal
        issueId={issueModalId}
        onClose={() => setIssueModalId(null)}
        onIssueUpdated={(updatedIssue) => {
          setIssues((prev) => prev.map((item) => (item.id === updatedIssue.id ? updatedIssue : item)))
        }}
      />
    </div>
  )
}

function QuickIssueForm({ projectId, onCreated }: { projectId: number; onCreated: () => Promise<void> }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim()) {
      setError('Issue title is required.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await issuesApi.create({
        title: title.trim(),
        description: description.trim() || undefined,
        type: 'TASK',
        priority: 'MEDIUM',
        projectId,
      })
      setTitle('')
      setDescription('')
      await onCreated()
    } catch (submitError: any) {
      setError(submitError.response?.data?.message ?? 'Unable to create issue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Implement API integration" />
      <label className="flex flex-col gap-1.5 text-sm text-slateBrand-700 dark:text-slateBrand-200">
        <span className="font-medium">Description</span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="min-h-24 rounded-xl border border-slateBrand-200 bg-white px-3 py-2 text-slateBrand-900 outline-none focus:border-mintBrand-500 dark:border-slateBrand-700 dark:bg-slateBrand-800 dark:text-slateBrand-100"
        />
      </label>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
      <Button loading={loading} type="submit">
        Create Issue
      </Button>
    </form>
  )
}
