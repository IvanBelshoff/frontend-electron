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
  sidePanel?: ReactNode
  sidePanelHeader?: ReactNode
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
  sidePanel,
  sidePanelHeader,
}: DialogProps) {
  if (!isOpen) {
    return null
  }

  const headerActionsRow = (
    <div className="flex items-center gap-2">
      {headerActions}
      <IconButton icon={<CloseIcon />} label={closeAriaLabel} onClick={onClose} />
    </div>
  )

  const header = (
    <div className="flex items-center justify-between gap-3 border-b border-vscode-border px-4 py-3">
      <h3 className="text-sm font-semibold text-vscode-text">{title}</h3>
      {headerActionsRow}
    </div>
  )

  const body = <div className={clsx('p-4', bodyClassName)}>{children}</div>

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
          'w-full rounded border border-vscode-border bg-vscode-sidebar shadow-xl',
          className ?? 'max-w-md',
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {sidePanel ? (
          <div className="grid grid-cols-[minmax(0,1fr)_1px_minmax(13rem,18rem)]">
            <div className="col-start-1 row-start-1 flex items-center justify-between gap-3 border-b border-vscode-border px-4 py-3">
              <h3 className="text-sm font-semibold text-vscode-text">{title}</h3>
              {headerActionsRow}
            </div>
            <div
              className="col-start-2 row-span-2 min-h-full w-px bg-vscode-border"
              aria-hidden="true"
            />
            <div className="col-start-3 row-start-1 flex min-w-0 items-center border-b border-vscode-border px-3 py-3">
              {sidePanelHeader}
            </div>
            <div className="col-start-1 row-start-2 min-w-0">{body}</div>
            <div className="col-start-3 row-start-2 flex h-0 min-h-full min-w-0 flex-col overflow-hidden bg-vscode-bg/30">
              {sidePanel}
            </div>
          </div>
        ) : (
          <>
            {header}
            {body}
          </>
        )}
      </div>
    </div>
  )
}
