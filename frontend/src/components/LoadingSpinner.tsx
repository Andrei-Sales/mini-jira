export function LoadingSpinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-8 text-slateBrand-600 dark:text-slateBrand-200">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-mintBrand-500 border-r-transparent" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}