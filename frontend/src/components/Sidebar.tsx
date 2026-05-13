import { LayoutDashboard, ClipboardList, KanbanSquare, Users, FolderOpen, UserCircle2 } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '../utils/cn'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderOpen },
  { to: '/kanban', label: 'Kanban', icon: KanbanSquare },
  { to: '/issues', label: 'Issues', icon: ClipboardList },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/profile', label: 'Profile', icon: UserCircle2 },
]

export function Sidebar() {
  return (
    <aside className="w-full border-b border-slateBrand-200 bg-white/90 px-4 py-4 backdrop-blur dark:border-slateBrand-800 dark:bg-slateBrand-900/90 md:w-64 md:border-b-0 md:border-r md:px-5 md:py-6">
      <div className="mb-6">
        <p className="font-display text-2xl font-bold text-slateBrand-900 dark:text-slateBrand-50">MiniJira</p>
        <p className="text-sm text-slateBrand-500 dark:text-slateBrand-300">Delivery cockpit</p>
      </div>
      <nav className="grid grid-cols-2 gap-2 md:grid-cols-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition',
                isActive
                  ? 'bg-slateBrand-900 text-white dark:bg-mintBrand-500 dark:text-slateBrand-900'
                  : 'text-slateBrand-700 hover:bg-slateBrand-100 dark:text-slateBrand-200 dark:hover:bg-slateBrand-800',
              )
            }
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}