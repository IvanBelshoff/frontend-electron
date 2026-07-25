import clsx from 'clsx'
import type { ReactNode } from 'react'
import IconButton from '@/components/ui/IconButton'
import { DashboardMaterialIcon } from '@/features/dashboards/icons/DashboardIcons'
import {
  SCHEMA_PANEL_WIDTH_COLLAPSED,
  SCHEMA_PANEL_WIDTH_EXPANDED,
} from '@/features/query-editor/query-editor-layout.constants'

type SchemaExplorerPanelProps = {
  collapsed: boolean
  onToggle: () => void
  children: ReactNode
}

export default function SchemaExplorerPanel({
  collapsed,
  onToggle,
  children,
}: SchemaExplorerPanelProps) {
  return (
    <aside
      className={clsx(
        'flex h-full min-h-0 shrink-0 flex-col overflow-hidden transition-[width] duration-200 ease-out',
        collapsed ? 'w-10' : 'w-[280px]',
      )}
      style={{
        width: collapsed ? SCHEMA_PANEL_WIDTH_COLLAPSED : SCHEMA_PANEL_WIDTH_EXPANDED,
      }}
      aria-label="Explorador de schema"
    >
      {collapsed ? (
        <div className="flex h-full flex-col items-center gap-2 rounded-md border border-vscode-border bg-vscode-sidebar/40 py-2">
          <IconButton
            icon={<DashboardMaterialIcon name="chevron_right" className="text-[1.05rem]" />}
            label="Expandir explorador de schema"
            onClick={onToggle}
            className="h-8 w-8 rounded-md text-vscode-text-muted hover:text-vscode-text"
          />
          <span
            className="text-[10px] font-semibold uppercase tracking-widest text-vscode-text-muted [writing-mode:vertical-rl]"
            aria-hidden="true"
          >
            Schema
          </span>
          <DashboardMaterialIcon
            name="account_tree"
            className="mt-auto text-[1.15rem] text-vscode-text-muted/70"
          />
        </div>
      ) : (
        <div className="flex h-full min-h-0 flex-col">{children}</div>
      )}
    </aside>
  )
}
