import type { Table } from '@tanstack/react-table'
import Button from '@/components/ui/Button'

export const REPORT_DATA_PAGE_SIZE_OPTIONS = [50, 100, 200] as const

type ReportDataTablePaginationProps<T> = {
  table: Table<T>
  totalLinhas?: number
}

export default function ReportDataTablePagination<T>({
  table,
  totalLinhas,
}: ReportDataTablePaginationProps<T>) {
  const { pageIndex, pageSize } = table.getState().pagination
  const pageCount = table.getPageCount()
  const rowCount = table.getFilteredRowModel().rows.length
  const total = totalLinhas ?? rowCount
  const start = rowCount === 0 ? 0 : pageIndex * pageSize + 1
  const end = rowCount === 0 ? 0 : Math.min((pageIndex + 1) * pageSize, rowCount)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-vscode-border bg-vscode-sidebar/60 px-4 py-3">
      <div className="flex flex-wrap items-center gap-3 text-sm text-vscode-text-muted">
        <span>
          Exibindo {start}–{end} de {total} linha(s)
        </span>
        <span>Página {pageIndex + 1} de {Math.max(pageCount, 1)}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-vscode-text-muted">
          Por página
          <select
            value={pageSize}
            onChange={(event) => table.setPageSize(Number(event.target.value))}
            className="rounded border border-vscode-border bg-vscode-input-bg px-2 py-1 text-sm text-vscode-text focus:outline-none focus:ring-2 focus:ring-vscode-accent/30"
          >
            {REPORT_DATA_PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <Button
          variant="secondary"
          size="sm"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
        >
          Anterior
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
        >
          Próxima
        </Button>
      </div>
    </div>
  )
}
