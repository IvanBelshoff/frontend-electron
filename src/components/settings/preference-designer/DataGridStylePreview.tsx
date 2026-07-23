import clsx from 'clsx'
import { resolveDataGridStyle } from '@/components/data-grid/resolve-data-grid-style'
import type { UserDataGridStylePreference } from '@/features/settings/user-preferences-types'

type DataGridStylePreviewProps = {
  style: UserDataGridStylePreference
}

const PREVIEW_COLUMNS = ['Coluna A', 'Coluna B', 'Coluna C']
const PREVIEW_ROW_COUNT = 10
const PREVIEW_ROWS = Array.from({ length: PREVIEW_ROW_COUNT }, (_, index) => `Linha ${index + 1}`)

export default function DataGridStylePreview({ style }: DataGridStylePreviewProps) {
  const resolved = resolveDataGridStyle(style)
  const rowLineClass = resolved.showRowLines ? 'border-b border-vscode-border' : ''

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-lg border border-vscode-border">
      <div className="shrink-0 border-b border-vscode-border bg-vscode-activity-bar px-3 py-1.5 text-xs font-medium text-vscode-text-muted">
        Pré-visualização
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto bg-vscode-bg px-3 pb-3">
        <table className="w-full border-separate border-spacing-0 text-left text-xs">
          <thead>
            <tr>
              {PREVIEW_COLUMNS.map((column, index) => (
                <th
                  key={column}
                  className={clsx(
                    resolved.previewHeaderCellClass,
                    'bg-vscode-activity-bar',
                    resolved.stickyHeader && 'sticky top-0 z-10 shadow-[0_1px_0_0_var(--vscode-border)]',
                    resolved.getHeaderColumnLineClass(index === PREVIEW_COLUMNS.length - 1),
                  )}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PREVIEW_ROWS.map((row, rowIndex) => {
              const rowBackgroundClass = resolved.getRowBackgroundClass(rowIndex)

              return (
                <tr
                  key={row}
                  className={rowBackgroundClass}
                >
                  {PREVIEW_COLUMNS.map((column, columnIndex) => (
                    <td
                      key={`${row}-${column}`}
                      className={clsx(
                        resolved.previewCellClass,
                        '!py-1.5',
                        rowBackgroundClass,
                        rowLineClass,
                        resolved.getBodyColumnLineClass(columnIndex === PREVIEW_COLUMNS.length - 1),
                      )}
                    >
                      {row}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
