import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slateBrand-200 bg-white p-6 shadow-card dark:border-slateBrand-800 dark:bg-slateBrand-900">
        <div className="mb-6 text-center">
          <h1 className="font-display text-3xl font-bold text-slateBrand-900 dark:text-slateBrand-50">MiniJira</h1>
          <p className="mt-1 text-sm text-slateBrand-500 dark:text-slateBrand-300">Plan. Build. Ship.</p>
        </div>
        <Outlet />
      </div>
    </div>
  )
}