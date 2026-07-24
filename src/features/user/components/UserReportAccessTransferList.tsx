import TransferList from '@/components/transfer-list/TransferList'
import UserAccessReportRow from '@/features/user/components/UserAccessReportRow'
import {
  countSelectableGrantedReports,
  isOwnerReport,
} from '@/features/user/user-report-access-utils'
import type { AccessReport } from '@/features/user/user-report-access-types'

type UserReportAccessTransferListProps = {
  userId: number
  availableReports: AccessReport[]
  grantedReports: AccessReport[]
  filteredAvailableReports: AccessReport[]
  filteredGrantedReports: AccessReport[]
  selectedAvailableIds: number[]
  selectedGrantedIds: number[]
  availableSearch: string
  grantedSearch: string
  onAvailableSearchChange: (value: string) => void
  onGrantedSearchChange: (value: string) => void
  onToggleAvailableReport: (reportId: number) => void
  onToggleGrantedReport: (reportId: number) => void
  onToggleSelectAllAvailable: () => void
  onToggleSelectAllGranted: () => void
  isAllAvailableSelected: boolean
  isAllGrantedSelected: boolean
  onMoveSelectedRight: () => void
  onMoveAllRight: () => void
  onMoveSelectedLeft: () => void
  onMoveAllLeft: () => void
  disabled?: boolean
  onToggleAiKnowledge?: (reportId: number) => void
}

export default function UserReportAccessTransferList({
  userId,
  availableReports,
  grantedReports,
  filteredAvailableReports,
  filteredGrantedReports,
  selectedAvailableIds,
  selectedGrantedIds,
  availableSearch,
  grantedSearch,
  onAvailableSearchChange,
  onGrantedSearchChange,
  onToggleAvailableReport,
  onToggleGrantedReport,
  onToggleSelectAllAvailable,
  onToggleSelectAllGranted,
  isAllAvailableSelected,
  isAllGrantedSelected,
  onMoveSelectedRight,
  onMoveAllRight,
  onMoveSelectedLeft,
  onMoveAllLeft,
  disabled = false,
  onToggleAiKnowledge,
}: UserReportAccessTransferListProps) {
  const grantedSelectableCount = countSelectableGrantedReports(filteredGrantedReports, userId)

  return (
    <TransferList
      available={{
        title: 'Relatórios disponíveis',
        count: availableReports.length,
        helper: 'Selecione um ou mais relatórios para conceder acesso ao usuário.',
        items: filteredAvailableReports,
        search: availableSearch,
        searchPlaceholder: 'Pesquisar por nome do relatório',
        emptyMessage: 'Nenhum relatório encontrado.',
        selectedIds: selectedAvailableIds,
        isAllSelected: isAllAvailableSelected,
        onSearchChange: onAvailableSearchChange,
        onToggleSelectAll: onToggleSelectAllAvailable,
      }}
      granted={{
        title: 'Relatórios com acesso',
        count: grantedReports.length,
        helper: 'Lista de relatórios atualmente vinculados ao usuário.',
        items: filteredGrantedReports,
        search: grantedSearch,
        searchPlaceholder: 'Pesquisar por nome do relatório',
        emptyMessage: 'Nenhum relatório encontrado.',
        selectedIds: selectedGrantedIds,
        isAllSelected: isAllGrantedSelected,
        onSearchChange: onGrantedSearchChange,
        onToggleSelectAll: onToggleSelectAllGranted,
      }}
      getItemId={(report) => report.id}
      isItemSelectable={(report, side) =>
        side === 'available' || !isOwnerReport(report, userId)
      }
      renderItem={(report, ctx) => (
        <UserAccessReportRow
          report={report}
          selected={ctx.selected}
          selectionDisabled={ctx.selectionDisabled}
          iaDisabled={disabled}
          isOwner={isOwnerReport(report, userId)}
          showAiKnowledge={ctx.side === 'granted'}
          onToggleAiKnowledge={
            ctx.side === 'granted' && onToggleAiKnowledge
              ? () => onToggleAiKnowledge(report.id)
              : undefined
          }
          onToggle={ctx.onToggle}
        />
      )}
      onToggleItem={(side, reportId) => {
        if (side === 'available') {
          onToggleAvailableReport(reportId)
          return
        }
        onToggleGrantedReport(reportId)
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
