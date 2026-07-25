import clsx from 'clsx'
import type { ReactNode } from 'react'
import Button from '@/components/ui/Button'
import IconButton from '@/components/ui/IconButton'
import { DashboardMaterialIcon } from '@/features/dashboards/icons/DashboardIcons'

type QueryEditorToolbarProps = {
  onFormat: () => void
  onCancel: () => void
  onExecute: () => void
  onSave: () => void
  canFormat?: boolean
  isExecuting?: boolean
  showRestoreLayout?: boolean
  onRestoreLayout?: () => void
  showResetSplitRatio?: boolean
  onResetSplitRatio?: () => void
}

function ToolbarSeparator() {
  return <div className="mx-0.5 h-5 w-px shrink-0 bg-vscode-border/70" aria-hidden="true" />
}

function ToolbarGroup({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-0.5" role="group" aria-label={label}>
      {children}
    </div>
  )
}

export default function QueryEditorToolbar({
  onFormat,
  onCancel,
  onExecute,
  onSave,
  canFormat = true,
  isExecuting = false,
  showRestoreLayout = false,
  onRestoreLayout,
  showResetSplitRatio = false,
  onResetSplitRatio,
}: QueryEditorToolbarProps) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg border border-vscode-border/60 bg-vscode-sidebar/25 p-0.5 shadow-sm">
      {showRestoreLayout && onRestoreLayout ? (
        <>
          <ToolbarGroup label="Layout">
            <IconButton
              icon={<DashboardMaterialIcon name="close_fullscreen" className="text-[1.05rem]" />}
              label="Restaurar layout dividido"
              onClick={onRestoreLayout}
              className="h-8 w-8 rounded-md text-vscode-accent hover:bg-vscode-accent/10"
            />
          </ToolbarGroup>
          <ToolbarSeparator />
        </>
      ) : null}
      {showResetSplitRatio && onResetSplitRatio ? (
        <>
          <ToolbarGroup label="Proporção">
            <IconButton
              icon={<DashboardMaterialIcon name="vertical_split" className="text-[1.05rem]" />}
              label="Restaurar editor e resultados (50%)"
              onClick={onResetSplitRatio}
              className="h-8 w-8 rounded-md text-vscode-text-muted hover:text-vscode-text"
            />
          </ToolbarGroup>
          <ToolbarSeparator />
        </>
      ) : null}
      <ToolbarGroup label="Editor">
        <IconButton
          icon={<DashboardMaterialIcon name="format_align_left" className="text-[1.05rem]" />}
          label="Formatar SQL (Ctrl+Shift+F)"
          onClick={onFormat}
          disabled={!canFormat}
          className="h-8 w-8 rounded-md text-vscode-text-muted hover:text-vscode-text"
        />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup label="Sessão">
        <IconButton
          icon={<DashboardMaterialIcon name="close" className="text-[1.05rem]" />}
          label="Cancelar e voltar"
          onClick={onCancel}
          className="h-8 w-8 rounded-md text-vscode-text-muted hover:text-vscode-text"
        />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup label="Query">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          loading={isExecuting}
          onClick={onExecute}
          className={clsx(
            'h-8 gap-1.5 rounded-md px-2.5',
            'text-emerald-400 hover:bg-emerald-400/10 hover:text-emerald-300',
          )}
        >
          <DashboardMaterialIcon name="play_arrow" className="text-[1.05rem]" filled />
          Executar
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onSave}
          className={clsx(
            'h-8 gap-1.5 rounded-md px-2.5',
            'text-vscode-accent hover:bg-vscode-accent/10 hover:text-vscode-accent',
          )}
        >
          <DashboardMaterialIcon name="save" className="text-[1.05rem]" />
          Salvar
        </Button>
      </ToolbarGroup>
    </div>
  )
}
