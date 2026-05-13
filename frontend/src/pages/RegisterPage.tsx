import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { useAuth } from '../hooks/useAuth'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await register({ fullName, email, password })
      navigate('/dashboard', { replace: true })
    } catch (submitError: any) {
      setError(submitError.response?.data?.message ?? 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input label="Full Name" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Jane Doe" />
      <Input label="Email" value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="jane@company.com" />
      <Input label="Password" value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="********" />
      <Input label="Confirm Password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type="password" placeholder="********" />
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <Button type="submit" className="w-full" loading={loading}>
        Register
      </Button>
      <p className="text-center text-sm text-slateBrand-500 dark:text-slateBrand-300">
        Already have an account?{' '}
        <Link className="font-semibold text-mintBrand-600 hover:underline" to="/login">
          Sign in
        </Link>
      </p>
    </form>
  )
}
