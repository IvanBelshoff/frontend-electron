import TransferList from '@/components/transfer-list/TransferList'
import type { TransferListSide } from '@/components/transfer-list/types'
import DashboardAccessUserRow from '@/features/dashboards/components/DashboardAccessUserRow'
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
  onMoveItem?: (fromSide: TransferListSide, itemId: number) => void | Promise<void>
  disabled?: boolean
  ownerId?: number | null
  showAiKnowledge?: boolean
  onToggleAiKnowledge?: (userId: number) => void
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
  onMoveItem,
  disabled = false,
  ownerId = null,
  showAiKnowledge = false,
  onToggleAiKnowledge,
}: DashboardAccessTransferListProps) {
  const grantedSelectableCount =
    ownerId != null
      ? filteredGrantedUsers.filter((user) => Number(user.id) !== Number(ownerId)).length
      : filteredGrantedUsers.length

  const isOwner = (user: AccessUser) =>
    ownerId != null && Number(user.id) === Number(ownerId)

  return (
    <TransferList
      available={{
        title: 'Usuários disponíveis',
        count: availableUsers.length,
        helper: 'Selecione um ou mais usuários para conceder acesso.',
        items: filteredAvailableUsers,
        search: availableSearch,
        searchPlaceholder: 'Pesquisar por nome',
        emptyMessage: 'Nenhum usuário encontrado.',
        selectedIds: selectedAvailableIds,
        isAllSelected: isAllAvailableSelected,
        onSearchChange: onAvailableSearchChange,
        onToggleSelectAll: onToggleSelectAllAvailable,
      }}
      granted={{
        title: 'Usuários com acesso',
        count: grantedUsers.length,
        helper: 'Selecione usuários para remover acesso, exceto o proprietário.',
        items: filteredGrantedUsers,
        search: grantedSearch,
        searchPlaceholder: 'Pesquisar por nome',
        emptyMessage: 'Nenhum usuário encontrado.',
        selectedIds: selectedGrantedIds,
        isAllSelected: isAllGrantedSelected,
        onSearchChange: onGrantedSearchChange,
        onToggleSelectAll: onToggleSelectAllGranted,
      }}
      getItemId={(user) => user.id}
      isItemSelectable={(user, side) =>
        side === 'available' || !isOwner(user)
      }
      renderItem={(user, ctx) => (
        <DashboardAccessUserRow
          user={user}
          selected={ctx.selected}
          selectionDisabled={ctx.selectionDisabled}
          iaDisabled={disabled}
          isOwner={isOwner(user)}
          showAiKnowledge={ctx.side === 'granted' && showAiKnowledge}
          onToggleAiKnowledge={
            ctx.side === 'granted' && onToggleAiKnowledge
              ? () => onToggleAiKnowledge(user.id)
              : undefined
          }
          onToggle={ctx.onToggle}
          dragHandle={ctx.dragHandle}
          isDragging={ctx.isDragging}
          isOverlay={ctx.isOverlay}
        />
      )}
      onToggleItem={(side, userId) => {
        if (side === 'available') {
          onToggleAvailableUser(userId)
          return
        }
        onToggleGrantedUser(userId)
      }}
      onMoveSelectedRight={onMoveSelectedRight}
      onMoveAllRight={onMoveAllRight}
      onMoveSelectedLeft={onMoveSelectedLeft}
      onMoveAllLeft={onMoveAllLeft}
      canMoveAllLeft={grantedSelectableCount}
      disabled={disabled}
      enableDragAndDrop={!disabled}
      onMoveItem={onMoveItem ? (fromSide, itemId) => void onMoveItem(fromSide, itemId) : undefined}
    />
  )
}
