import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { FilterOptionButton } from '@/features/dashboards/icons/DashboardIcons'
import type { AdminJobsFilters } from '@/features/jobs/jobs-types'
import type { ReportJobStatus, ReportJobTipo } from '@/features/reports/report-types'
import { dayEndIso, dayStartIso, toDateInputValue } from '@/lib/datetime'

type JobsToolbarProps = {
  filters: AdminJobsFilters
  jobIdSearch: string
  onJobIdSearchChange: (value: string) => void
  onApplyJobIdSearch: () => void
  onStatusChange: (status?: ReportJobStatus) => void
  onTipoChange: (tipo?: ReportJobTipo) => void
  onRelatorioIdChange: (relatorioId?: number) => void
  onDateRangeChange: (createdFrom?: string, createdTo?: string) => void
  onClearFilters: () => void
  onRefresh: () => void
  isRefreshing?: boolean
  total: number
}

const STATUS_OPTIONS: Array<{ value?: ReportJobStatus; label: string }> = [
  { label: 'Todos' },
  { value: 'queued', label: 'Na fila' },
  { value: 'processing', label: 'Processando' },
  { value: 'completed', label: 'Concluído' },
  { value: 'failed', label: 'Falhou' },
]

const TIPO_OPTIONS: Array<{ value?: ReportJobTipo; label: string }> = [
  { label: 'Todos' },
  { value: 'snapshot', label: 'Snapshot' },
  { value: 'export_csv', label: 'Export CSV' },
]

export default function JobsToolbar({
  filters,
  jobIdSearch,
  onJobIdSearchChange,
  onApplyJobIdSearch,
  onStatusChange,
  onTipoChange,
  onRelatorioIdChange,
  onDateRangeChange,
  onClearFilters,
  onRefresh,
  isRefreshing = false,
  total,
}: JobsToolbarProps) {
  return (
    <div className="space-y-4 rounded-lg border border-vscode-border bg-vscode-sidebar/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-vscode-text-muted">
          {total} job{total === 1 ? '' : 's'} encontrado{total === 1 ? '' : 's'}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onClearFilters}>
            Limpar filtros
          </Button>
          <Button variant="secondary" size="sm" onClick={onRefresh} loading={isRefreshing}>
            Atualizar
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[220px] flex-1">
          <label className="mb-1 block text-xs font-medium text-vscode-text">Job ID</label>
          <div className="flex gap-2">
            <Input
              value={jobIdSearch}
              onChange={(event) => onJobIdSearchChange(event.target.value)}
              placeholder="Buscar por UUID..."
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  onApplyJobIdSearch()
                }
              }}
            />
            <Button variant="secondary" size="sm" onClick={onApplyJobIdSearch}>
              Buscar
            </Button>
          </div>
        </div>

        <div className="min-w-[140px]">
          <label className="mb-1 block text-xs font-medium text-vscode-text">Relatório ID</label>
          <Input
            type="number"
            min={1}
            value={filters.relatorioId ?? ''}
            onChange={(event) => {
              const value = event.target.value
              onRelatorioIdChange(value ? Number(value) : undefined)
            }}
            placeholder="ID"
          />
        </div>

        <div className="min-w-[150px]">
          <label className="mb-1 block text-xs font-medium text-vscode-text">De</label>
          <Input
            type="date"
            value={toDateInputValue(filters.createdFrom)}
            onChange={(event) =>
              onDateRangeChange(
                event.target.value ? dayStartIso(event.target.value) : undefined,
                filters.createdTo,
              )
            }
          />
        </div>

        <div className="min-w-[150px]">
          <label className="mb-1 block text-xs font-medium text-vscode-text">Até</label>
          <Input
            type="date"
            value={toDateInputValue(filters.createdTo)}
            onChange={(event) =>
              onDateRangeChange(
                filters.createdFrom,
                event.target.value ? dayEndIso(event.target.value) : undefined,
              )
            }
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <span className="block text-xs font-medium text-vscode-text">Status</span>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((option) => (
              <FilterOptionButton
                key={option.label}
                active={filters.status === option.value}
                onClick={() => onStatusChange(option.value)}
              >
                {option.label}
              </FilterOptionButton>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <span className="block text-xs font-medium text-vscode-text">Tipo</span>
          <div className="flex flex-wrap gap-2">
            {TIPO_OPTIONS.map((option) => (
              <FilterOptionButton
                key={option.label}
                active={filters.tipo === option.value}
                onClick={() => onTipoChange(option.value)}
              >
                {option.label}
              </FilterOptionButton>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
