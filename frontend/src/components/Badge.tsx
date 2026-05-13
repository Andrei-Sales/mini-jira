import type { ReactNode } from 'react'
import { cn } from '../utils/cn'

interface BadgeProps {
  children: ReactNode
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info'
}

const tones = {
  neutral: 'bg-slateBrand-100 text-slateBrand-700 dark:bg-slateBrand-800 dark:text-slateBrand-100',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  danger: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  info: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
}

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold', tones[tone])}>{children}</span>
}
