import { Plus } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { projectsApi } from '../api/projectsApi'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Input } from '../components/Input'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { Modal } from '../components/Modal'
import { Table } from '../components/Table'
import { useAuth } from '../hooks/useAuth'
import type { Project } from '../types'
import { formatDate, initials } from '../utils/date'
import { statusLabel } from '../utils/constants'

const statusTone: Record<string, 'success' | 'warning' | 'neutral'> = {
  ACTIVE: 'success',
  ON_HOLD: 'warning',
  ARCHIVED: 'neutral',
}

export function ProjectsPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [deletingProjectId, setDeletingProjectId] = useState<number | null>(null)

  const [projectKey, setProjectKey] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const canManageProjects = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER'

  async function loadProjects() {
    setLoading(true)
    try {
      const response = await projectsApi.list({ page: 0, size: 50 })
      setProjects(response.content)
    } catch (loadError: any) {
      setError(loadError.response?.data?.message ?? 'Failed to load projects.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  async function handleCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!projectKey.trim() || !name.trim()) {
      setError('Project key and name are required.')
      return
    }

    try {
      await projectsApi.create({
        projectKey: projectKey.trim().toUpperCase(),
        name: name.trim(),
        description: description.trim() || undefined,
      })
      setOpenCreate(false)
      setProjectKey('')
      setName('')
      setDescription('')
      setError('')
      await loadProjects()
    } catch (createError: any) {
      setError(createError.response?.data?.message ?? 'Unable to create project.')
    }
  }

  async function handleDeleteProject() {
    if (!deletingProjectId) return
    await projectsApi.remove(deletingProjectId)
    setDeletingProjectId(null)
    await loadProjects()
  }

  if (loading) return <LoadingSpinner label="Loading projects..." />

  return (
    <div className="space-y-4">
      <Card
        title="Projects"
        action={
          canManageProjects ? (
            <Button icon={<Plus size={16} />} onClick={() => setOpenCreate(true)}>
              New Project
            </Button>
          ) : null
        }
      >
        {error ? <p className="mb-3 text-sm text-red-500">{error}</p> : null}
        <Table
          rows={projects}
          rowKey={(project) => project.id}
          columns={[
            {
              key: 'name',
              header: 'Project',
              render: (project) => (
                <div>
                  <Link className="font-semibold text-mintBrand-700 hover:underline dark:text-mintBrand-300" to={`/projects/${project.id}`}>
                    {project.name}
                  </Link>
                  <p className="text-xs text-slateBrand-500">{project.projectKey}</p>
                </div>
              ),
            },
            {
              key: 'lead',
              header: 'Lead',
              render: (project) => (
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slateBrand-100 text-xs font-bold text-slateBrand-700 dark:bg-slateBrand-700 dark:text-slateBrand-100">
                    {initials(project.lead.fullName)}
                  </span>
                  <span>{project.lead.fullName}</span>
                </div>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (project) => <Badge tone={statusTone[project.status] ?? 'neutral'}>{statusLabel(project.status)}</Badge>,
            },
            {
              key: 'createdAt',
              header: 'Created',
              render: (project) => formatDate(project.createdAt),
            },
            {
              key: 'actions',
              header: 'Actions',
              render: (project) =>
                canManageProjects ? (
                  <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => setDeletingProjectId(project.id)}>
                    Delete
                  </Button>
                ) : (
                  <span className="text-xs text-slateBrand-500">Read only</span>
                ),
            },
          ]}
        />
      </Card>

      <Modal open={openCreate} onClose={() => setOpenCreate(false)} title="Create Project">
        <form className="space-y-3" onSubmit={handleCreateProject}>
          <Input label="Project Key" value={projectKey} onChange={(event) => setProjectKey(event.target.value)} placeholder="MINI" maxLength={10} />
          <Input label="Project Name" value={name} onChange={(event) => setName(event.target.value)} placeholder="MiniJira Platform" />
          <label className="flex flex-col gap-1.5 text-sm text-slateBrand-700 dark:text-slateBrand-200">
            <span className="font-medium">Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-28 rounded-xl border border-slateBrand-200 bg-white px-3 py-2 text-slateBrand-900 outline-none focus:border-mintBrand-500 dark:border-slateBrand-700 dark:bg-slateBrand-800 dark:text-slateBrand-100"
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpenCreate(false)} type="button">
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deletingProjectId)}
        title="Delete project"
        description="This action removes the project and its linked issues. Continue?"
        onCancel={() => setDeletingProjectId(null)}
        onConfirm={handleDeleteProject}
        confirmLabel="Delete"
      />
    </div>
  )
}
