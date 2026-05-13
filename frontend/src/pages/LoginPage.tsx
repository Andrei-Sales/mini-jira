import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('admin@minijira.dev')
  const [password, setPassword] = useState('Admin@123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Email and password are required.')
      return
    }

    setLoading(true)
    try {
      await login({ email, password })
      const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/dashboard'
      navigate(redirectTo, { replace: true })
    } catch (submitError: any) {
      setError(submitError.response?.data?.message ?? 'Login failed. Please verify your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input label="Email" value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="you@company.com" />
      <Input label="Password" value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="********" />
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <Button type="submit" className="w-full" loading={loading}>
        Login
      </Button>
      <p className="text-center text-sm text-slateBrand-500 dark:text-slateBrand-300">
        New here?{' '}
        <Link className="font-semibold text-mintBrand-600 hover:underline" to="/register">
          Create an account
        </Link>
      </p>
    </form>
  )
}
