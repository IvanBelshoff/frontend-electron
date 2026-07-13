import clsx from 'clsx'
import type { ReactNode } from 'react'
import IconButton from './IconButton'

type DialogProps = {
  isOpen: boolean
  title: string
  onClose: () => void
  children: ReactNode
  className?: string
  bodyClassName?: string
  headerActions?: ReactNode
  closeAriaLabel?: string
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

export default function Dialog({
  isOpen,
  title,
  onClose,
  children,
  className,
  bodyClassName,
  headerActions,
  closeAriaLabel = 'Fechar',
}: DialogProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className={clsx(
          'w-full max-w-md rounded border border-vscode-border bg-vscode-sidebar shadow-xl',
          className,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-vscode-border px-4 py-3">
          <h3 className="text-sm font-semibold text-vscode-text">{title}</h3>
          <div className="flex items-center gap-2">
            {headerActions}
            <IconButton icon={<CloseIcon />} label={closeAriaLabel} onClick={onClose} />
          </div>
        </div>

        <div className={clsx('p-4', bodyClassName)}>{children}</div>
      </div>
    </div>
  )
}
