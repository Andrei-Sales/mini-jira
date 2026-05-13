import { LogOut, Moon, Search, Sun } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { initials } from '../utils/date'
import { Button } from './Button'

export function Navbar() {
  const [query, setQuery] = useState('')
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="flex flex-col gap-3 border-b border-slateBrand-200 bg-white/70 px-4 py-3 backdrop-blur dark:border-slateBrand-800 dark:bg-slateBrand-900/60 md:flex-row md:items-center md:justify-between md:px-6">
      <label className="flex w-full items-center gap-2 rounded-xl border border-slateBrand-200 bg-white px-3 py-2 text-sm text-slateBrand-500 dark:border-slateBrand-700 dark:bg-slateBrand-800 md:max-w-sm">
        <Search size={16} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search projects, issues, users"
          className="w-full border-0 bg-transparent text-slateBrand-800 outline-none placeholder:text-slateBrand-400 dark:text-slateBrand-100"
        />
      </label>

      <div className="flex items-center justify-between gap-3 md:justify-end">
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-xl border border-slateBrand-200 p-2 text-slateBrand-600 transition hover:bg-slateBrand-100 dark:border-slateBrand-700 dark:text-slateBrand-200 dark:hover:bg-slateBrand-800"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {user ? (
          <div className="flex items-center gap-2 rounded-xl border border-slateBrand-200 bg-white px-2 py-1.5 dark:border-slateBrand-700 dark:bg-slateBrand-800">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-mintBrand-100 text-sm font-bold text-mintBrand-700 dark:bg-mintBrand-900/40 dark:text-mintBrand-300">
              {initials(user.fullName)}
            </span>
            <div className="hidden text-left md:block">
              <p className="text-sm font-semibold text-slateBrand-800 dark:text-slateBrand-100">{user.fullName}</p>
              <p className="text-xs text-slateBrand-500 dark:text-slateBrand-300">{user.role.replace('_', ' ')}</p>
            </div>
            <Button variant="ghost" className="p-2" onClick={() => logout()} icon={<LogOut size={15} />}>
              <span className="hidden md:block">Logout</span>
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  )
}