import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import type { AiTableSpec } from '@/features/ai/ai-table-types'

type AiTableRendererProps = {
  spec: AiTableSpec
}

const PAGE_SIZE = 10

function formatCell(value: string | number | null): string {
  if (value === null || value === undefined) {
    return '—'
  }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value) : value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
  }
  return String(value)
}

export default function AiTableRenderer({ spec }: AiTableRendererProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = useMemo<ColumnDef<Record<string, string | number | null>>[]>(
    () =>
      spec.columns.map((column) => ({
        id: column.key,
        accessorKey: column.key,
        header: column.label,
        cell: ({ getValue }) => formatCell(getValue() as string | number | null),
        meta: { align: column.align ?? 'left' },
      })),
    [spec.columns],
  )

  const table = useReactTable({
    data: spec.rows,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: PAGE_SIZE } },
  })

  return (
    <figure className="my-3 rounded-lg border border-vscode-border/70 bg-vscode-bg/40 p-3">
      <figcaption className="mb-2">
        <span className="block text-xs font-semibold text-vscode-text">{spec.title}</span>
        {spec.subtitle && (
          <span className="block text-[11px] text-vscode-text-muted">{spec.subtitle}</span>
        )}
      </figcaption>

      <div className="mb-2">
        <input
          type="search"
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          placeholder="Filtrar tabela…"
          className="w-full rounded border border-vscode-border bg-vscode-input-bg px-2 py-1 text-xs text-vscode-text"
          aria-label="Filtrar tabela"
        />
      </div>

      <div className="overflow-x-auto rounded border border-vscode-border/60">
        <table className="min-w-full text-xs">
          <thead className="bg-vscode-sidebar/80 text-vscode-text-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const align =
                    (header.column.columnDef.meta as { align?: 'left' | 'right' } | undefined)
                      ?.align ?? 'left'

                  return (
                    <th
                      key={header.id}
                      className={`px-2 py-1.5 font-medium ${align === 'right' ? 'text-right' : 'text-left'}`}
                    >
                      {header.isPlaceholder ? null : (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 hover:text-vscode-text"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: ' ↑',
                            desc: ' ↓',
                          }[header.column.getIsSorted() as string] ?? null}
                        </button>
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t border-vscode-border/40">
                {row.getVisibleCells().map((cell) => {
                  const align =
                    (cell.column.columnDef.meta as { align?: 'left' | 'right' } | undefined)
                      ?.align ?? 'left'

                  return (
                    <td
                      key={cell.id}
                      className={`px-2 py-1.5 text-vscode-text ${align === 'right' ? 'text-right tabular-nums' : 'text-left'}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-vscode-text-muted">
        <span>
          {table.getFilteredRowModel().rows.length} linha(s)
          {spec.truncado ? ' · truncado' : ''}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            className="rounded border border-vscode-border px-2 py-0.5 disabled:opacity-40"
          >
            Anterior
          </button>
          <span>
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
          </span>
          <button
            type="button"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            className="rounded border border-vscode-border px-2 py-0.5 disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      </div>

      {(spec.source || spec.footnote) && (
        <p className="mt-2 text-[10px] leading-relaxed text-vscode-text-muted/80">
          {[spec.source, spec.footnote].filter(Boolean).join(' · ')}
        </p>
      )}
    </figure>
  )
}
