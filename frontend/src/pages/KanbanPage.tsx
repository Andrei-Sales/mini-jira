import { DndContext, PointerSensor, closestCorners, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { issuesApi } from '../api/issuesApi'
import { projectsApi } from '../api/projectsApi'
import { Card } from '../components/Card'
import { IssueDetailsModal } from '../components/IssueDetailsModal'
import { KanbanColumn } from '../components/KanbanColumn'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { Select } from '../components/Select'
import type { Issue, IssueStatus, Project } from '../types'
import { ISSUE_STATUS_OPTIONS, statusLabel } from '../utils/constants'

export function KanbanPage() {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const [searchParams, setSearchParams] = useSearchParams()

  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null)

  const columns = useMemo(() => {
    return ISSUE_STATUS_OPTIONS.map((status) => ({
      status,
      title: statusLabel(status),
      issues: issues.filter((issue) => issue.status === status),
    }))
  }, [issues])

  async function loadProjectsAndIssues(initialProjectId?: number | null) {
    setLoading(true)
    try {
      const projectResponse = await projectsApi.list({ page: 0, size: 100 })
      setProjects(projectResponse.content)

      const fallbackId = initialProjectId ?? projectResponse.content[0]?.id ?? null
      setSelectedProjectId(fallbackId)

      if (fallbackId) {
        const issueResponse = await issuesApi.list({ projectId: fallbackId, page: 0, size: 200 })
        setIssues(issueResponse.content)
      } else {
        setIssues([])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const initialProject = Number(searchParams.get('projectId')) || null
    loadProjectsAndIssues(initialProject)
  }, [])

  async function loadIssues(projectId: number | null) {
    if (!projectId) {
      setIssues([])
      return
    }

    const response = await issuesApi.list({ projectId, page: 0, size: 200 })
    setIssues(response.content)
  }

  async function handleProjectChange(projectId: number | null) {
    setSelectedProjectId(projectId)
    if (projectId) {
      setSearchParams({ projectId: String(projectId) })
    } else {
      setSearchParams({})
    }
    await loadIssues(projectId)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const activeIssueId = Number(active.id)
    const draggedIssue = issues.find((issue) => issue.id === activeIssueId)
    if (!draggedIssue) return

    const overId = String(over.id)
    const statuses = new Set<IssueStatus>(ISSUE_STATUS_OPTIONS)
    let targetStatus: IssueStatus | undefined

    if (statuses.has(overId as IssueStatus)) {
      targetStatus = overId as IssueStatus
    } else {
      const overIssue = issues.find((issue) => String(issue.id) === overId)
      targetStatus = overIssue?.status
    }

    if (!targetStatus || draggedIssue.status === targetStatus) {
      return
    }

    setIssues((prev) => prev.map((issue) => (issue.id === activeIssueId ? { ...issue, status: targetStatus! } : issue)))

    try {
      const updatedIssue = await issuesApi.updateStatus(activeIssueId, targetStatus)
      setIssues((prev) => prev.map((issue) => (issue.id === updatedIssue.id ? updatedIssue : issue)))
    } catch {
      await loadIssues(selectedProjectId)
    }
  }

  if (loading) return <LoadingSpinner label="Loading board..." />

  return (
    <div className="space-y-4">
      <Card title="Kanban Board">
        <div className="max-w-sm">
          <Select
            label="Project"
            value={selectedProjectId ?? ''}
            options={projects.map((project) => ({ value: project.id, label: `${project.projectKey} - ${project.name}` }))}
            onChange={(event) => handleProjectChange(Number(event.target.value) || null)}
          />
        </div>
      </Card>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="grid gap-4 lg:grid-cols-4">
          {columns.map((column) => (
            <KanbanColumn key={column.status} status={column.status} title={column.title} issues={column.issues} onOpenIssue={setSelectedIssueId} />
          ))}
        </div>
      </DndContext>

      <IssueDetailsModal
        issueId={selectedIssueId}
        onClose={() => setSelectedIssueId(null)}
        onIssueUpdated={(updatedIssue) => {
          setIssues((prev) => prev.map((issue) => (issue.id === updatedIssue.id ? updatedIssue : issue)))
        }}
      />
    </div>
  )
}