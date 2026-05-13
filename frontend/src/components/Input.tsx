import type { InputHTMLAttributes } from 'react'
import { cn } from '../utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <label className="flex w-full flex-col gap-1.5 text-sm text-slateBrand-700 dark:text-slateBrand-200">
      {label ? <span className="font-medium">{label}</span> : null}
      <input
        className={cn(
          'rounded-xl border border-slateBrand-200 bg-white px-3 py-2 text-slateBrand-900 outline-none ring-0 transition focus:border-mintBrand-500 dark:border-slateBrand-700 dark:bg-slateBrand-800 dark:text-slateBrand-100',
          className,
        )}
        {...props}
      />
      {error ? <span className="text-xs text-red-500">{error}</span> : null}
    </label>
  )
}