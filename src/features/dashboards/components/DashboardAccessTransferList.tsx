import DashboardAccessMoveButtons from '@/features/dashboards/components/DashboardAccessMoveButtons'
import DashboardAccessUserColumn from '@/features/dashboards/components/DashboardAccessUserColumn'
import type { AccessUser } from '@/features/user/user-types'

type DashboardAccessTransferListProps = {
  availableUsers: AccessUser[]
  grantedUsers: AccessUser[]
  filteredAvailableUsers: AccessUser[]
  filteredGrantedUsers: AccessUser[]
  selectedAvailableIds: number[]
  selectedGrantedIds: number[]
  availableSearch: string
  grantedSearch: string
  onAvailableSearchChange: (value: string) => void
  onGrantedSearchChange: (value: string) => void
  onToggleAvailableUser: (userId: number) => void
  onToggleGrantedUser: (userId: number) => void
  onToggleSelectAllAvailable: () => void
  onToggleSelectAllGranted: () => void
  isAllAvailableSelected: boolean
  isAllGrantedSelected: boolean
  onMoveSelectedRight: () => void
  onMoveAllRight: () => void
  onMoveSelectedLeft: () => void
  onMoveAllLeft: () => void
  disabled?: boolean
  ownerId?: number | null
}

export default function DashboardAccessTransferList({
  availableUsers,
  grantedUsers,
  filteredAvailableUsers,
  filteredGrantedUsers,
  selectedAvailableIds,
  selectedGrantedIds,
  availableSearch,
  grantedSearch,
  onAvailableSearchChange,
  onGrantedSearchChange,
  onToggleAvailableUser,
  onToggleGrantedUser,
  onToggleSelectAllAvailable,
  onToggleSelectAllGranted,
  isAllAvailableSelected,
  isAllGrantedSelected,
  onMoveSelectedRight,
  onMoveAllRight,
  onMoveSelectedLeft,
  onMoveAllLeft,
  disabled = false,
  ownerId = null,
}: DashboardAccessTransferListProps) {
  return (
    <div className="grid h-full min-h-0 gap-4 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:items-stretch">
      <DashboardAccessUserColumn
        title="Usuários disponíveis"
        count={availableUsers.length}
        helper="Selecione um ou mais usuários para conceder acesso."
        users={filteredAvailableUsers}
        selectedIds={selectedAvailableIds}
        search={availableSearch}
        onSearchChange={onAvailableSearchChange}
        onToggleUser={onToggleAvailableUser}
        onToggleSelectAll={onToggleSelectAllAvailable}
        isAllSelected={isAllAvailableSelected}
        disabled={disabled}
      />

      <DashboardAccessMoveButtons
        disabled={disabled}
        onMoveSelectedRight={onMoveSelectedRight}
        onMoveAllRight={onMoveAllRight}
        onMoveSelectedLeft={onMoveSelectedLeft}
        onMoveAllLeft={onMoveAllLeft}
      />

      <DashboardAccessUserColumn
        title="Usuários com acesso"
        count={grantedUsers.length}
        helper="Selecione usuários para remover acesso, exceto o criador."
        users={filteredGrantedUsers}
        selectedIds={selectedGrantedIds}
        search={grantedSearch}
        onSearchChange={onGrantedSearchChange}
        onToggleUser={onToggleGrantedUser}
        onToggleSelectAll={onToggleSelectAllGranted}
        isAllSelected={isAllGrantedSelected}
        disabled={disabled}
        ownerId={ownerId}
      />
    </div>
  )
}
