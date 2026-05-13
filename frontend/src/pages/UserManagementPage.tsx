import { useEffect, useState, type FormEvent } from 'react'
import { usersApi } from '../api/usersApi'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Input } from '../components/Input'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { Modal } from '../components/Modal'
import { Select } from '../components/Select'
import { Table } from '../components/Table'
import { useAuth } from '../hooks/useAuth'
import { useDebounce } from '../hooks/useDebounce'
import type { Role, User } from '../types'
import { ROLE_OPTIONS, roleLabel } from '../utils/constants'

export function UserManagementPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [deactivateId, setDeactivateId] = useState<number | null>(null)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('DEVELOPER')

  const isAdmin = user?.role === 'ADMIN'

  async function loadUsers() {
    setLoading(true)
    setError('')
    try {
      const response = await usersApi.list({ page: 0, size: 200, search: debouncedSearch || undefined })
      setUsers(response.content)
    } catch (loadError: any) {
      setError(loadError.response?.data?.message ?? 'Unable to load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      loadUsers()
    }
  }, [isAdmin, debouncedSearch])

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.')
      return
    }

    try {
      await usersApi.create({ fullName: fullName.trim(), email: email.trim(), password, role })
      setOpenCreate(false)
      setFullName('')
      setEmail('')
      setPassword('')
      setRole('DEVELOPER')
      await loadUsers()
    } catch (submitError: any) {
      setError(submitError.response?.data?.message ?? 'Unable to create user.')
    }
  }

  async function handleRoleUpdate(userId: number, nextRole: Role) {
    await usersApi.updateRole(userId, nextRole)
    setUsers((prev) => prev.map((entry) => (entry.id === userId ? { ...entry, role: nextRole } : entry)))
  }

  async function handleDeactivate() {
    if (!deactivateId) return
    await usersApi.deactivate(deactivateId)
    setUsers((prev) => prev.map((entry) => (entry.id === deactivateId ? { ...entry, active: false } : entry)))
    setDeactivateId(null)
  }

  if (!isAdmin) {
    return (
      <Card>
        <p className="text-sm text-slateBrand-600 dark:text-slateBrand-300">User management is available only for ADMIN users.</p>
      </Card>
    )
  }

  if (loading) return <LoadingSpinner label="Loading users..." />

  return (
    <div className="space-y-4">
      <Card
        title="User Management"
        action={<Button onClick={() => setOpenCreate(true)}>Create User</Button>}
      >
        <div className="mb-4 max-w-sm">
          <Input label="Search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name or email" />
        </div>
        {error ? <p className="mb-3 text-sm text-red-500">{error}</p> : null}
        <Table
          rows={users}
          rowKey={(entry) => entry.id}
          columns={[
            {
              key: 'name',
              header: 'Name',
              render: (entry) => (
                <div>
                  <p className="font-semibold text-slateBrand-800 dark:text-slateBrand-100">{entry.fullName}</p>
                  <p className="text-xs text-slateBrand-500">{entry.email}</p>
                </div>
              ),
            },
            {
              key: 'role',
              header: 'Role',
              render: (entry) => (
                <select
                  className="rounded-lg border border-slateBrand-200 bg-white px-2 py-1 text-xs dark:border-slateBrand-700 dark:bg-slateBrand-800"
                  value={entry.role}
                  onChange={(event) => handleRoleUpdate(entry.id, event.target.value as Role)}
                >
                  {ROLE_OPTIONS.map((item) => (
                    <option value={item} key={item}>
                      {roleLabel(item)}
                    </option>
                  ))}
                </select>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (entry) => <Badge tone={entry.active ? 'success' : 'neutral'}>{entry.active ? 'Active' : 'Inactive'}</Badge>,
            },
            {
              key: 'actions',
              header: 'Actions',
              render: (entry) =>
                entry.active ? (
                  <Button variant="ghost" className="px-2 py-1 text-xs text-red-600" onClick={() => setDeactivateId(entry.id)}>
                    Deactivate
                  </Button>
                ) : (
                  <span className="text-xs text-slateBrand-500">-</span>
                ),
            },
          ]}
        />
      </Card>

      <Modal open={openCreate} onClose={() => setOpenCreate(false)} title="Create User">
        <form className="space-y-3" onSubmit={handleCreateUser}>
          <Input label="Full Name" value={fullName} onChange={(event) => setFullName(event.target.value)} />
          <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          <Select
            label="Role"
            value={role}
            options={ROLE_OPTIONS.map((item) => ({ label: roleLabel(item), value: item }))}
            onChange={(event) => setRole(event.target.value as Role)}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpenCreate(false)}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deactivateId)}
        title="Deactivate user"
        description="The user will no longer be able to sign in. Continue?"
        onCancel={() => setDeactivateId(null)}
        onConfirm={handleDeactivate}
        confirmLabel="Deactivate"
      />
    </div>
  )
}
