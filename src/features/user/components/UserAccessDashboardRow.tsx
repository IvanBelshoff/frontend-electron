import AccessOwnerBadge from '@/components/access/AccessOwnerBadge'
import TransferListSelectableRow from '@/components/transfer-list/TransferListSelectableRow'
import { DashboardMaterialIcon } from '@/features/dashboards/icons/DashboardIcons'
import type { AccessDashboard } from '@/features/user/user-dashboard-access-types'

type UserAccessDashboardRowProps = {
  dashboard: AccessDashboard
  selected: boolean
  disabled?: boolean
  isOwner?: boolean
  onToggle: () => void
}

export default function UserAccessDashboardRow({
  dashboard,
  selected,
  disabled = false,
  isOwner = false,
  onToggle,
}: UserAccessDashboardRowProps) {
  return (
    <TransferListSelectableRow
      selected={selected}
      selectionDisabled={disabled}
      onToggle={onToggle}
      itemId={dashboard.id}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-vscode-accent/25 bg-vscode-accent/10 text-vscode-accent">
        <DashboardMaterialIcon name={dashboard.icone} className="text-[1.15rem]" filled />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-vscode-text">{dashboard.nome}</span>
        {isOwner && <AccessOwnerBadge />}
      </span>
    </TransferListSelectableRow>
  )
}
