import { useState, type FormEvent } from 'react'
import { authApi } from '../api/authApi'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Input } from '../components/Input'
import { useAuth } from '../hooks/useAuth'
import { roleLabel } from '../utils/constants'

export function ProfilePage() {
  const { user, refreshProfile } = useAuth()
  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  if (!user) return null

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!fullName.trim()) {
      setError('Full name is required.')
      return
    }

    setLoading(true)
    try {
      await authApi.updateProfile(fullName.trim())
      await refreshProfile()
      setMessage('Profile updated successfully.')
    } catch (updateError: any) {
      setError(updateError.response?.data?.message ?? 'Unable to update profile.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card title="Profile">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input label="Full Name" value={fullName} onChange={(event) => setFullName(event.target.value)} />
          <Input label="Email" value={user.email} disabled />
          <Input label="Role" value={roleLabel(user.role)} disabled />
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
          <Button loading={loading} type="submit">
            Save Changes
          </Button>
        </form>
      </Card>
    </div>
  )
}
