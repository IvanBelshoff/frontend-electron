import clsx from 'clsx'
import { useId, useState, type ReactNode } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@/features/dashboards/icons/DashboardIcons'

type SettingsAccordionProps = {
  title: string
  children: ReactNode
  defaultExpanded?: boolean
}

export default function SettingsAccordion({
  title,
  children,
  defaultExpanded = false,
}: SettingsAccordionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const panelId = useId()

  return (
    <div className="shrink-0 rounded-lg border border-vscode-border bg-vscode-bg/30">
      <button
        type="button"
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        aria-controls={panelId}
      >
        <span
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded text-vscode-text-muted"
          aria-hidden="true"
        >
          {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </span>
        <span className="min-w-0 flex-1 text-sm font-medium text-vscode-text">{title}</span>
      </button>

      {expanded ? (
        <div
          id={panelId}
          className={clsx(
            'max-h-[min(50vh,28rem)] overflow-y-auto border-t border-vscode-border/70 px-3 py-3',
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}
