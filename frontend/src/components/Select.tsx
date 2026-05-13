import type { SelectHTMLAttributes } from 'react'
import { cn } from '../utils/cn'

interface Option {
  label: string
  value: string | number
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: Option[]
  error?: string
}

export function Select({ label, options, error, className, ...props }: SelectProps) {
  return (
    <label className="flex w-full flex-col gap-1.5 text-sm text-slateBrand-700 dark:text-slateBrand-200">
      {label ? <span className="font-medium">{label}</span> : null}
      <select
        className={cn(
          'rounded-xl border border-slateBrand-200 bg-white px-3 py-2 text-slateBrand-900 outline-none transition focus:border-mintBrand-500 dark:border-slateBrand-700 dark:bg-slateBrand-800 dark:text-slateBrand-100',
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className="text-xs text-red-500">{error}</span> : null}
    </label>
  )
}