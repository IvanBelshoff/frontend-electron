import clsx from 'clsx'
import { RefreshIcon } from '@/components/settings/SettingsIcons'
import SettingsSelect from '@/components/settings/SettingsSelect'
import Button from '@/components/ui/Button'
import IconButton from '@/components/ui/IconButton'
import Input from '@/components/ui/Input'
import { hasActiveConnectionFilters } from '@/features/connections/connection-filters'
import type { ConnectionFilters } from '@/features/connections/connection-filters'
import type { TipoConexao } from '@/features/connections/connection-types'
import { PlusIcon, SearchIcon } from '@/features/dashboards/icons/DashboardIcons'

type ConnectionManagementHeaderProps = {
  filteredCount: number
  totalCount: number
  isRefreshing: boolean
  onRefresh: () => void
  search: string
  onSearchChange: (value: string) => void
  filters: ConnectionFilters
  onFiltersChange: (filters: ConnectionFilters) => void
  onCreate: () => void
}

const TIPO_OPTIONS: Array<{ value: TipoConexao | 'all'; label: string }> = [
  { value: 'all', label: 'Todos os tipos' },
  { value: 'postgres', label: 'PostgreSQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'mssql', label: 'SQL Server' },
  { value: 'oracle', label: 'Oracle' },
]

export default function ConnectionManagementHeader({
  filteredCount,
  totalCount,
  isRefreshing,
  onRefresh,
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  onCreate,
}: ConnectionManagementHeaderProps) {
  const hasActiveFilters = hasActiveConnectionFilters(filters)

  return (
    <header className="shrink-0 space-y-4 border-b border-vscode-border bg-vscode-bg pb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-vscode-text">Gerenciamento de Conexões</h1>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-vscode-border px-3 py-1 text-xs text-vscode-text-muted">
            Exibindo {filteredCount} de {totalCount} conexões
          </span>

          <IconButton
            icon={
              isRefreshing ? (
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
                  aria-hidden="true"
                />
              ) : (
                <RefreshIcon />
              )
            }
            label="Atualizar listagem"
            title="Atualizar listagem"
            onClick={onRefresh}
            disabled={isRefreshing}
          />
        </div>
      </div>

      <div className="rounded-lg border border-vscode-border bg-vscode-sidebar/80 p-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vscode-text-muted" />
              <Input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Pesquisar conexões por nome"
                className="pl-9"
                aria-label="Pesquisar conexões por nome"
              />
            </div>

            <SettingsSelect
              value={filters.tipo}
              aria-label="Filtrar por tipo de conexão"
              className={clsx(
                'sm:w-48',
                hasActiveFilters && 'border-vscode-accent focus:ring-vscode-accent/30',
              )}
              onChange={(event) =>
                onFiltersChange({
                  tipo: event.target.value as TipoConexao | 'all',
                })
              }
            >
              {TIPO_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SettingsSelect>
          </div>

          <Button variant="primary" size="md" onClick={onCreate}>
            <PlusIcon />
            Criar
          </Button>
        </div>
      </div>
    </header>
  )
}
