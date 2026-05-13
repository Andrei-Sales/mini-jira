export function formatDate(value?: string): string {
  if (!value) return '-'
  const date = new Date(value)
  return date.toLocaleDateString()
}

export function formatDateTime(value?: string): string {
  if (!value) return '-'
  const date = new Date(value)
  return date.toLocaleString()
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}