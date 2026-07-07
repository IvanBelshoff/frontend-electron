import Button from '@/components/ui/Button'

type MyDashboardEmptyStateProps = {
  onClearFilters: () => void
}

export default function MyDashboardEmptyState({ onClearFilters }: MyDashboardEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-vscode-border bg-vscode-sidebar/40 px-6 py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-vscode-border bg-vscode-input-bg/60 text-vscode-text-muted">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-7 w-7"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-vscode-text">Nenhum dashboard encontrado</h3>
      <p className="mt-2 max-w-md text-sm text-vscode-text-muted">
        Ajuste a busca ou os filtros para encontrar dashboards, ou limpe os filtros ativos.
      </p>

      <Button variant="secondary" size="sm" className="mt-6" onClick={onClearFilters}>
        Limpar filtros
      </Button>
    </div>
  )
}
