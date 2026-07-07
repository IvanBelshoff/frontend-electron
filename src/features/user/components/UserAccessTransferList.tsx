import DashboardAccessMoveButtons from '@/features/dashboards/components/DashboardAccessMoveButtons'
import UserAccessDashboardColumn from '@/features/user/components/UserAccessDashboardColumn'
import type { AccessDashboard } from '@/features/user/user-dashboard-access-types'

type UserAccessTransferListProps = {
  userId: number
  availableDashboards: AccessDashboard[]
  grantedDashboards: AccessDashboard[]
  filteredAvailableDashboards: AccessDashboard[]
  filteredGrantedDashboards: AccessDashboard[]
  selectedAvailableIds: number[]
  selectedGrantedIds: number[]
  availableSearch: string
  grantedSearch: string
  onAvailableSearchChange: (value: string) => void
  onGrantedSearchChange: (value: string) => void
  onToggleAvailableDashboard: (dashboardId: number) => void
  onToggleGrantedDashboard: (dashboardId: number) => void
  onToggleSelectAllAvailable: () => void
  onToggleSelectAllGranted: () => void
  isAllAvailableSelected: boolean
  isAllGrantedSelected: boolean
  onMoveSelectedRight: () => void
  onMoveAllRight: () => void
  onMoveSelectedLeft: () => void
  onMoveAllLeft: () => void
  disabled?: boolean
}

export default function UserAccessTransferList({
  userId,
  availableDashboards,
  grantedDashboards,
  filteredAvailableDashboards,
  filteredGrantedDashboards,
  selectedAvailableIds,
  selectedGrantedIds,
  availableSearch,
  grantedSearch,
  onAvailableSearchChange,
  onGrantedSearchChange,
  onToggleAvailableDashboard,
  onToggleGrantedDashboard,
  onToggleSelectAllAvailable,
  onToggleSelectAllGranted,
  isAllAvailableSelected,
  isAllGrantedSelected,
  onMoveSelectedRight,
  onMoveAllRight,
  onMoveSelectedLeft,
  onMoveAllLeft,
  disabled = false,
}: UserAccessTransferListProps) {
  return (
    <div className="grid h-full min-h-0 gap-4 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:items-stretch">
      <UserAccessDashboardColumn
        title="Dashboards disponíveis"
        count={availableDashboards.length}
        helper="Selecione um ou mais dashboards para conceder acesso ao usuário."
        dashboards={filteredAvailableDashboards}
        selectedIds={selectedAvailableIds}
        search={availableSearch}
        onSearchChange={onAvailableSearchChange}
        onToggleDashboard={onToggleAvailableDashboard}
        onToggleSelectAll={onToggleSelectAllAvailable}
        isAllSelected={isAllAvailableSelected}
        disabled={disabled}
      />

      <DashboardAccessMoveButtons
        disabled={disabled}
        canMoveSelectedRight={selectedAvailableIds.length > 0}
        canMoveSelectedLeft={selectedGrantedIds.length > 0}
        onMoveSelectedRight={onMoveSelectedRight}
        onMoveAllRight={onMoveAllRight}
        onMoveSelectedLeft={onMoveSelectedLeft}
        onMoveAllLeft={onMoveAllLeft}
      />

      <UserAccessDashboardColumn
        title="Dashboards com acesso"
        count={grantedDashboards.length}
        helper="Lista de dashboards atualmente vinculados ao usuário."
        dashboards={filteredGrantedDashboards}
        selectedIds={selectedGrantedIds}
        search={grantedSearch}
        onSearchChange={onGrantedSearchChange}
        onToggleDashboard={onToggleGrantedDashboard}
        onToggleSelectAll={onToggleSelectAllGranted}
        isAllSelected={isAllGrantedSelected}
        disabled={disabled}
        userId={userId}
      />
    </div>
  )
}
