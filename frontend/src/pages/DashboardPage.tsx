import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { dashboardApi } from '../api/dashboardApi'
import { Card } from '../components/Card'
import { LoadingSpinner } from '../components/LoadingSpinner'
import type { ActivityLog, DashboardStats } from '../types'
import { formatDateTime } from '../utils/date'
import { statusLabel } from '../utils/constants'

const chartColors = ['#4e72b6', '#27ac86', '#f59e0b', '#ef4444']

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activity, setActivity] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [statsResponse, activityResponse] = await Promise.all([
          dashboardApi.stats(),
          dashboardApi.activity(),
        ])
        setStats(statsResponse)
        setActivity(activityResponse)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const statusData = useMemo(() => {
    if (!stats) return []
    return Object.entries(stats.issuesByStatus).map(([status, count]) => ({
      status,
      count,
    }))
  }, [stats])

  if (loading || !stats) {
    return <LoadingSpinner label="Loading dashboard..." />
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-xs uppercase tracking-wide text-slateBrand-500">Total Projects</p>
          <p className="mt-2 font-display text-3xl font-bold text-slateBrand-900 dark:text-slateBrand-50">{stats.totalProjects}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slateBrand-500">Total Issues</p>
          <p className="mt-2 font-display text-3xl font-bold text-slateBrand-900 dark:text-slateBrand-50">{stats.totalIssues}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slateBrand-500">My Issues</p>
          <p className="mt-2 font-display text-3xl font-bold text-slateBrand-900 dark:text-slateBrand-50">{stats.myIssuesCount}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slateBrand-500">Done Ratio</p>
          <p className="mt-2 font-display text-3xl font-bold text-slateBrand-900 dark:text-slateBrand-50">
            {stats.totalIssues ? Math.round(((stats.issuesByStatus.DONE ?? 0) / stats.totalIssues) * 100) : 0}%
          </p>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card title="Issues by Status">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <XAxis dataKey="status" tickFormatter={statusLabel} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={entry.status} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Workload Split">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="count"
                  nameKey="status"
                  outerRadius={100}
                  label={({ name }) => statusLabel(String(name))}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={entry.status} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <Card title="Recent Activity">
        <div className="space-y-3">
          {activity.slice(0, 12).map((item) => (
            <article key={item.id} className="rounded-xl border border-slateBrand-200 px-3 py-2 text-sm dark:border-slateBrand-800">
              <p className="font-semibold text-slateBrand-700 dark:text-slateBrand-100">{item.description ?? `${item.action} ${item.entityType}`}</p>
              <p className="text-xs text-slateBrand-500">{formatDateTime(item.createdAt)}</p>
            </article>
          ))}
          {activity.length === 0 ? <p className="text-sm text-slateBrand-500">No activity yet.</p> : null}
        </div>
      </Card>
    </div>
  )
}
