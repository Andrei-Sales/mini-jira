import type { ReactNode } from 'react'
import { cn } from '../utils/cn'

interface CardProps {
  children: ReactNode
  title?: string
  className?: string
  action?: ReactNode
}

export function Card({ children, title, className, action }: CardProps) {
  return (
    <section className={cn('rounded-2xl border border-slateBrand-200 bg-white p-5 shadow-card dark:border-slateBrand-800 dark:bg-slateBrand-900', className)}>
      {title ? (
        <header className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-slateBrand-900 dark:text-slateBrand-50">{title}</h3>
          {action}
        </header>
      ) : null}
      {children}
    </section>
  )
}