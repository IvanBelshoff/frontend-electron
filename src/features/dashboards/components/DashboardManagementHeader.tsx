import DashboardPageHeader from '@/features/dashboards/components/DashboardPageHeader'
import DashboardToolbar from '@/features/dashboards/components/DashboardToolbar'
import type { DashboardFilters, DashboardViewMode } from '@/features/dashboards/dashboard-types'

type DashboardManagementHeaderProps = {
  filteredCount: number
  totalCount: number
  isRefreshing: boolean
  onRefresh: () => void
  search: string
  onSearchChange: (value: string) => void
  filters: DashboardFilters
  onOpenFilters: () => void
  viewMode: DashboardViewMode
  onViewModeChange: (mode: DashboardViewMode) => void
  onCreate: () => void
  canCreate?: boolean
}

export default function DashboardManagementHeader({
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
}: DashboardManagementHeaderProps) {
  return (
    <header className="shrink-0 space-y-4 border-b border-vscode-border bg-vscode-bg pb-4">
      <DashboardPageHeader
        filteredCount={filteredCount}
        totalCount={totalCount}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
      />

      <DashboardToolbar
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
