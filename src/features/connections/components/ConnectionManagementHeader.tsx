import ConnectionPageHeader from '@/features/connections/components/ConnectionPageHeader'
import ConnectionToolbar from '@/features/connections/components/ConnectionToolbar'
import type { ConnectionFilters } from '@/features/connections/connection-filters'
import type { ConnectionViewMode } from '@/features/connections/connection-list-types'

type ConnectionManagementHeaderProps = {
  filteredCount: number
  totalCount: number
  isRefreshing: boolean
  onRefresh: () => void
  search: string
  onSearchChange: (value: string) => void
  filters: ConnectionFilters
  onOpenFilters: () => void
  viewMode: ConnectionViewMode
  onViewModeChange: (mode: ConnectionViewMode) => void
  onCreate: () => void
  canCreate?: boolean
}

export default function ConnectionManagementHeader({
  filteredCount,
  totalCount,
  isRefreshing,
  onRefresh,
  search,
  onSearchChange,
  filters,
  onOpenFilters,
  viewMode,
  onViewModeChange,
  onCreate,
  canCreate = true,
}: ConnectionManagementHeaderProps) {
  return (
    <header className="shrink-0 space-y-4 border-b border-vscode-border bg-vscode-bg pb-4">
      <ConnectionPageHeader
        filteredCount={filteredCount}
        totalCount={totalCount}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
      />

      <ConnectionToolbar
        search={search}
        onSearchChange={onSearchChange}
        filters={filters}
        onOpenFilters={onOpenFilters}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        onCreate={onCreate}
        canCreate={canCreate}
      />
    </header>
  )
}
