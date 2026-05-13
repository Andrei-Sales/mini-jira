import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '../utils/cn'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  widthClassName?: string
}

export function Modal({ open, title, onClose, children, widthClassName }: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slateBrand-950/55 p-4" onClick={onClose}>
      <div
        className={cn(
          'w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl dark:bg-slateBrand-900',
          widthClassName,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-slateBrand-900 dark:text-slateBrand-50">{title}</h2>
          <button
            className="rounded-lg p-1.5 text-slateBrand-500 transition hover:bg-slateBrand-100 hover:text-slateBrand-700 dark:hover:bg-slateBrand-800"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}