import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../utils/cn'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  loading?: boolean
  icon?: ReactNode
}

const styles: Record<Variant, string> = {
  primary:
    'bg-mintBrand-600 text-white hover:bg-mintBrand-700 dark:bg-mintBrand-500 dark:hover:bg-mintBrand-600',
  secondary:
    'bg-slateBrand-100 text-slateBrand-800 hover:bg-slateBrand-200 dark:bg-slateBrand-800 dark:text-slateBrand-100 dark:hover:bg-slateBrand-700',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'bg-transparent text-slateBrand-700 hover:bg-slateBrand-100 dark:text-slateBrand-200 dark:hover:bg-slateBrand-800',
}

export function Button({
  className,
  children,
  variant = 'primary',
  loading,
  disabled,
  icon,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
        styles[variant],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Please wait...' : icon}
      <span>{children}</span>
    </button>
  )
}