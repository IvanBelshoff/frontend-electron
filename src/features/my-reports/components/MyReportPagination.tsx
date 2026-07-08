import Button from '@/components/ui/Button'

type MyReportPaginationProps = {
  page: number
  totalPages: number
  onPrevious: () => void
  onNext: () => void
}

export default function MyReportPagination({
  page,
  totalPages,
  onPrevious,
  onNext,
}: MyReportPaginationProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-vscode-border bg-vscode-sidebar/60 px-4 py-3">
      <span className="text-sm text-vscode-text-muted">
        Página {page} de {totalPages}
      </span>

      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={onPrevious}>
          Anterior
        </Button>
        <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={onNext}>
          Próxima
        </Button>
      </div>
    </div>
  )
}
