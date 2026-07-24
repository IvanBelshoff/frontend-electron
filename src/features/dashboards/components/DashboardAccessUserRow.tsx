import type { ReactNode } from 'react'
import AccessOwnerBadge from '@/components/access/AccessOwnerBadge'
import AiKnowledgeToggleButton from '@/components/transfer-list/AiKnowledgeToggleButton'
import TransferListSelectableRow from '@/components/transfer-list/TransferListSelectableRow'
import { getAccessUserFullName } from '@/features/dashboards/dashboard-access-utils'
import type { AccessUser } from '@/features/user/user-types'
import UserAvatar from '@/features/user/UserAvatar'

type DashboardAccessUserRowProps = {
  user: AccessUser
  selected: boolean
  selectionDisabled?: boolean
  iaDisabled?: boolean
  isOwner?: boolean
  showAiKnowledge?: boolean
  onToggleAiKnowledge?: () => void
  onToggle: () => void
  dragHandle?: ReactNode
  isDragging?: boolean
  isOverlay?: boolean
}

export default function DashboardAccessUserRow({
  user,
  selected,
  selectionDisabled = false,
  iaDisabled = false,
  isOwner = false,
  showAiKnowledge = false,
  onToggleAiKnowledge,
  onToggle,
  dragHandle,
  isDragging = false,
  isOverlay = false,
}: DashboardAccessUserRowProps) {
  const fullName = getAccessUserFullName(user)

  const actions =
    !isOverlay && showAiKnowledge && onToggleAiKnowledge ? (
      <AiKnowledgeToggleButton
        active={user.permitirConhecimentoIa}
        disabled={iaDisabled}
        onClick={onToggleAiKnowledge}
      />
    ) : undefined

  return (
    <TransferListSelectableRow
      selected={selected}
      selectionDisabled={selectionDisabled}
      onToggle={onToggle}
      itemId={user.id}
      actions={actions}
      dragHandle={dragHandle}
      isDragging={isDragging}
      isOverlay={isOverlay}
    >
      <UserAvatar
        userId={user.id}
        nome={user.nome}
        sobrenome={user.sobrenome}
        foto={user.foto}
      />

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-vscode-text">{fullName}</span>
        {isOwner && <AccessOwnerBadge />}
      </span>
    </TransferListSelectableRow>
  )
}
