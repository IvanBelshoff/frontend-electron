import clsx from 'clsx'
import IconButton from '@/components/ui/IconButton'
import { DashboardMaterialIcon } from '@/features/dashboards/icons/DashboardIcons'

type QueryResultsFooterActionsProps = {
  focused: boolean
  onFocus: () => void
  onClear: () => void
}

export function QueryResultsFooterActions({
  focused,
  onFocus,
  onClear,
}: QueryResultsFooterActionsProps) {
  return (
    <div className="flex items-center gap-0.5 border-l border-vscode-border/60 pl-2" role="group" aria-label="Ações do resultado">
      <IconButton
        icon={
          <DashboardMaterialIcon
            name={focused ? 'close_fullscreen' : 'open_in_full'}
            className="text-[0.95rem]"
          />
        }
        label={focused ? 'Restaurar layout dividido' : 'Focar resultados'}
        onClick={onFocus}
        aria-pressed={focused}
        className={clsx(
          'h-7 w-7 rounded',
          focused
            ? 'text-vscode-accent hover:bg-vscode-accent/10'
            : 'text-vscode-text-muted hover:bg-vscode-sidebar hover:text-vscode-text',
        )}
      />
      <IconButton
        icon={<DashboardMaterialIcon name="delete_outline" className="text-[0.95rem]" />}
        label="Limpar resultado"
        onClick={onClear}
        className="h-7 w-7 rounded text-vscode-text-muted hover:bg-vscode-sidebar hover:text-vscode-text"
      />
    </div>
  )
}
