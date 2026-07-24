import type { ReactNode } from 'react'
import AccessOwnerBadge from '@/components/access/AccessOwnerBadge'
import AiKnowledgeToggleButton from '@/components/transfer-list/AiKnowledgeToggleButton'
import TransferListSelectableRow from '@/components/transfer-list/TransferListSelectableRow'
import { DashboardMaterialIcon } from '@/features/dashboards/icons/DashboardIcons'
import type { AccessReport } from '@/features/user/user-report-access-types'

type UserAccessReportRowProps = {
  report: AccessReport
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

export default function UserAccessReportRow({
  report,
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
}: UserAccessReportRowProps) {
  const actions =
    !isOverlay && showAiKnowledge && onToggleAiKnowledge ? (
      <AiKnowledgeToggleButton
        active={report.permitirConhecimentoIa}
        disabled={iaDisabled}
        onClick={onToggleAiKnowledge}
      />
    ) : undefined

  return (
    <TransferListSelectableRow
      selected={selected}
      selectionDisabled={selectionDisabled}
      onToggle={onToggle}
      itemId={report.id}
      actions={actions}
      dragHandle={dragHandle}
      isDragging={isDragging}
      isOverlay={isOverlay}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-vscode-accent/25 bg-vscode-accent/10 text-vscode-accent">
        <DashboardMaterialIcon name={report.icone} className="text-[1.15rem]" filled />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-vscode-text">{report.nome}</span>
        {isOwner && <AccessOwnerBadge />}
      </span>
    </TransferListSelectableRow>
  )
}
