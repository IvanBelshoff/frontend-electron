import clsx from 'clsx'

type ReportDataTableProps = {
  colunas: string[]
  dados: Record<string, unknown>[]
  className?: string
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '—'
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}

function ReportDataEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-vscode-border bg-vscode-sidebar/50 px-6 py-16 text-center">
      <h3 className="text-base font-semibold text-vscode-text">Nenhum dado disponível</h3>
      <p className="mt-1 max-w-sm text-sm text-vscode-text-muted">
        Execute o relatório ou aguarde a geração do snapshot para visualizar os resultados.
      </p>
    </div>
  )
}

export default function ReportDataTable({ colunas, dados, className }: ReportDataTableProps) {
  if (colunas.length === 0 || dados.length === 0) {
    return <ReportDataEmptyState />
  }

  return (
    <div className={clsx('overflow-auto rounded-lg border border-vscode-border', className)}>
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="sticky top-0 z-10 border-b border-vscode-border bg-vscode-activity-bar">
            {colunas.map((coluna) => (
              <th
                key={coluna}
                className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-vscode-text-muted"
              >
                {coluna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dados.map((row, index) => {
            const rowClassName = index % 2 === 0 ? 'bg-vscode-sidebar' : 'bg-vscode-input-bg/30'

            return (
              <tr key={index} className={clsx('border-b border-vscode-border', rowClassName)}>
                {colunas.map((coluna) => (
                  <td
                    key={coluna}
                    className="max-w-xs truncate px-4 py-3 text-vscode-text"
                    title={formatCellValue(row[coluna])}
                  >
                    {formatCellValue(row[coluna])}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
