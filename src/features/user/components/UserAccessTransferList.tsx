import TransferList from '@/components/transfer-list/TransferList'
import UserAccessDashboardRow from '@/features/user/components/UserAccessDashboardRow'
import {
  countSelectableGrantedDashboards,
  isOwnerDashboard,
} from '@/features/user/user-dashboard-access-utils'
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
  const grantedSelectableCount = countSelectableGrantedDashboards(
    filteredGrantedDashboards,
    userId,
  )

  return (
    <TransferList
      available={{
        title: 'Dashboards disponíveis',
        count: availableDashboards.length,
        helper: 'Selecione um ou mais dashboards para conceder acesso ao usuário.',
        items: filteredAvailableDashboards,
        search: availableSearch,
        searchPlaceholder: 'Pesquisar por nome do dashboard',
        emptyMessage: 'Nenhum dashboard encontrado.',
        selectedIds: selectedAvailableIds,
        isAllSelected: isAllAvailableSelected,
        onSearchChange: onAvailableSearchChange,
        onToggleSelectAll: onToggleSelectAllAvailable,
      }}
      granted={{
        title: 'Dashboards com acesso',
        count: grantedDashboards.length,
        helper: 'Lista de dashboards atualmente vinculados ao usuário.',
        items: filteredGrantedDashboards,
        search: grantedSearch,
        searchPlaceholder: 'Pesquisar por nome do dashboard',
        emptyMessage: 'Nenhum dashboard encontrado.',
        selectedIds: selectedGrantedIds,
        isAllSelected: isAllGrantedSelected,
        onSearchChange: onGrantedSearchChange,
        onToggleSelectAll: onToggleSelectAllGranted,
      }}
      getItemId={(dashboard) => dashboard.id}
      isItemSelectable={(dashboard, side) =>
        side === 'available' || !isOwnerDashboard(dashboard, userId)
      }
      renderItem={(dashboard, ctx) => (
        <UserAccessDashboardRow
          dashboard={dashboard}
          selected={ctx.selected}
          disabled={ctx.selectionDisabled}
          isOwner={isOwnerDashboard(dashboard, userId)}
          onToggle={ctx.onToggle}
        />
      )}
      onToggleItem={(side, dashboardId) => {
        if (side === 'available') {
          onToggleAvailableDashboard(dashboardId)
          return
        }
        onToggleGrantedDashboard(dashboardId)
      }}
      onMoveSelectedRight={onMoveSelectedRight}
      onMoveAllRight={onMoveAllRight}
      onMoveSelectedLeft={onMoveSelectedLeft}
      onMoveAllLeft={onMoveAllLeft}
      canMoveAllLeft={grantedSelectableCount}
      disabled={disabled}
    />
  )
}
