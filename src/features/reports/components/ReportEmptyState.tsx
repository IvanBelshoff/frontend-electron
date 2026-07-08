import Button from '@/components/ui/Button'
import { TableIcon } from '@/features/dashboards/icons/DashboardIcons'

type ReportEmptyStateProps = {
  onClearFilters: () => void
}

export default function ReportEmptyState({ onClearFilters }: ReportEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-vscode-border bg-vscode-sidebar/50 px-6 py-16 text-center">
      <span className="mb-4 text-vscode-text-muted">
        <TableIcon className="h-10 w-10" />
      </span>

      <h3 className="text-base font-semibold text-vscode-text">Nenhum relatório encontrado</h3>
      <p className="mt-1 max-w-sm text-sm text-vscode-text-muted">
        Ajuste a busca ou os filtros para encontrar relatórios, ou limpe os filtros ativos.
      </p>

      <Button variant="secondary" size="sm" className="mt-5" onClick={onClearFilters}>
        Limpar filtros
      </Button>
    </div>
  )
}
