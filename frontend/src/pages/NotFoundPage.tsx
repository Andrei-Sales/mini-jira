import { Link } from 'react-router-dom'
import { Button } from '../components/Button'

export function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center p-4">
      <div className="rounded-2xl border border-slateBrand-200 bg-white p-8 text-center shadow-card dark:border-slateBrand-800 dark:bg-slateBrand-900">
        <h1 className="font-display text-3xl font-bold text-slateBrand-900 dark:text-slateBrand-50">Page not found</h1>
        <p className="mt-2 text-sm text-slateBrand-500 dark:text-slateBrand-300">The page you requested does not exist.</p>
        <Link to="/dashboard">
          <Button className="mt-5">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}