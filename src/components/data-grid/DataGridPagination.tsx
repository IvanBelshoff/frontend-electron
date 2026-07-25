import type { OnChangeFn, PaginationState, Table } from '@tanstack/react-table'
import type { ReactNode } from 'react'
import clsx from 'clsx'
import Button from '@/components/ui/Button'

export const DATA_GRID_PAGE_SIZE_OPTIONS = [25, 50, 100, 200] as const

type DataGridPaginationProps<T> = {
  table: Table<T>
  totalRows?: number
  manual?: boolean
  pageIndex?: number
  pageSize?: number
  pageCount?: number
  onPaginationChange?: OnChangeFn<PaginationState>
  isFetching?: boolean
  extra?: ReactNode
  position?: 'top' | 'bottom'
}

export default function DataGridPagination<T>({
  table,
  totalRows,
  manual = false,
  pageIndex: controlledPageIndex,
  pageSize: controlledPageSize,
  pageCount: controlledPageCount,
  onPaginationChange,
  isFetching = false,
  extra,
  position = 'top',
}: DataGridPaginationProps<T>) {
  const tablePagination = table.getState().pagination
  const pageIndex = manual ? (controlledPageIndex ?? 0) : tablePagination.pageIndex
  const pageSize = manual
    ? (controlledPageSize ?? DATA_GRID_PAGE_SIZE_OPTIONS[1])
    : tablePagination.pageSize
  const pageCount = manual
    ? Math.max(controlledPageCount ?? 1, 1)
    : Math.max(table.getPageCount(), 1)

  const rowCount = manual ? (totalRows ?? 0) : table.getFilteredRowModel().rows.length
  const total = totalRows ?? rowCount
  const start = total === 0 ? 0 : pageIndex * pageSize + 1
  const end = total === 0 ? 0 : Math.min((pageIndex + 1) * pageSize, total)

  const canPrevious = pageIndex > 0
  const canNext = pageIndex + 1 < pageCount
  const compact = Boolean(extra)

  const setPageIndex = (nextIndex: number) => {
    if (manual && onPaginationChange) {
      onPaginationChange({ pageIndex: nextIndex, pageSize })
      return
    }

    table.setPageIndex(nextIndex)
  }

  const setPageSize = (nextSize: number) => {
    if (manual && onPaginationChange) {
      onPaginationChange({ pageIndex: 0, pageSize: nextSize })
      return
    }

    table.setPageSize(nextSize)
  }

  const pageControls = (
    <>
      <label className="flex items-center gap-2 text-sm text-vscode-text-muted">
        Por página
        <select
          value={pageSize}
          onChange={(event) => setPageSize(Number(event.target.value))}
          disabled={isFetching}
          className="rounded border border-vscode-border bg-vscode-input-bg px-2 py-1 text-sm text-vscode-text focus:outline-none focus:ring-2 focus:ring-vscode-accent/30"
        >
          {DATA_GRID_PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>

      <Button
        variant="secondary"
        size="sm"
        disabled={!canPrevious || isFetching}
        onClick={() => setPageIndex(pageIndex - 1)}
      >
        Anterior
      </Button>
      <Button
        variant="secondary"
        size="sm"
        disabled={!canNext || isFetching}
        onClick={() => setPageIndex(pageIndex + 1)}
      >
        Próxima
      </Button>
    </>
  )

  return (
    <div
      className={clsx(
        'flex flex-wrap items-center justify-between gap-2 border border-vscode-border bg-vscode-sidebar/60',
        compact ? 'px-3 py-2' : 'rounded-lg px-4 py-3',
        position === 'bottom' && compact && 'rounded-b-lg border-t border-vscode-border bg-vscode-sidebar/80',
      )}
    >
      {compact ? (
        <div className="flex flex-wrap items-center gap-2">{pageControls}</div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 text-sm text-vscode-text-muted">
            <span>
              Exibindo {start}–{end} de {total} linha(s)
              {isFetching ? ' · atualizando…' : ''}
            </span>
            <span>
              Página {pageIndex + 1} de {pageCount}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">{pageControls}</div>
        </>
      )}

      {extra ? <div className="flex flex-wrap items-center gap-2">{extra}</div> : null}
    </div>
  )
}
