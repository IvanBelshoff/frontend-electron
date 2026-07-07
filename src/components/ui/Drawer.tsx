import clsx from 'clsx'
import { useEffect, useRef, type ReactNode } from 'react'
import IconButton from './IconButton'

type DrawerProps = {
  isOpen: boolean
  title: string
  onClose: () => void
  children: ReactNode
  className?: string
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

export default function Drawer({
  isOpen,
  title,
  onClose,
  children,
  className,
  closeAriaLabel = 'Fechar',
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    panelRef.current?.focus()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen, onClose])

  return (
    <div
      className={clsx(
        'fixed inset-0 z-50 flex justify-end transition-opacity duration-200',
        isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
      )}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        aria-label="Fechar painel"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        tabIndex={isOpen ? 0 : -1}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={clsx(
          'relative flex h-full w-full max-w-[22rem] flex-col border-l border-vscode-border bg-vscode-sidebar shadow-2xl transition-transform duration-200 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
          className,
        )}
      >
        <div className="flex items-center justify-between border-b border-vscode-border px-4 py-3">
          <h3 className="text-sm font-semibold text-vscode-text">{title}</h3>
          <IconButton icon={<CloseIcon />} label={closeAriaLabel} onClick={onClose} />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  )
}
