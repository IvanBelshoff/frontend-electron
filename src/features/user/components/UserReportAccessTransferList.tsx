import DashboardAccessMoveButtons from '@/features/dashboards/components/DashboardAccessMoveButtons'
import {
  countSelectableGrantedReports,
} from '@/features/user/user-report-access-utils'
import UserAccessReportColumn from '@/features/user/components/UserAccessReportColumn'
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
    <div className="grid h-full min-h-0 gap-4 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:items-stretch">
      <UserAccessReportColumn
        title="Relatórios disponíveis"
        count={availableReports.length}
        helper="Selecione um ou mais relatórios para conceder acesso ao usuário."
        reports={filteredAvailableReports}
        selectedIds={selectedAvailableIds}
        search={availableSearch}
        onSearchChange={onAvailableSearchChange}
        onToggleReport={onToggleAvailableReport}
        onToggleSelectAll={onToggleSelectAllAvailable}
        isAllSelected={isAllAvailableSelected}
        disabled={disabled}
      />

      <DashboardAccessMoveButtons
        disabled={disabled}
        canMoveSelectedRight={selectedAvailableIds.length > 0}
        canMoveSelectedLeft={selectedGrantedIds.length > 0}
        canMoveAllRight={filteredAvailableReports.length > 0}
        canMoveAllLeft={grantedSelectableCount > 0}
        onMoveSelectedRight={onMoveSelectedRight}
        onMoveAllRight={onMoveAllRight}
        onMoveSelectedLeft={onMoveSelectedLeft}
        onMoveAllLeft={onMoveAllLeft}
      />

      <UserAccessReportColumn
        title="Relatórios com acesso"
        count={grantedReports.length}
        helper="Lista de relatórios atualmente vinculados ao usuário."
        reports={filteredGrantedReports}
        selectedIds={selectedGrantedIds}
        search={grantedSearch}
        onSearchChange={onGrantedSearchChange}
        onToggleReport={onToggleGrantedReport}
        onToggleSelectAll={onToggleSelectAllGranted}
        isAllSelected={isAllGrantedSelected}
        disabled={disabled}
        userId={userId}
        showAiKnowledge
        onToggleAiKnowledge={onToggleAiKnowledge}
      />
    </div>
  )
}
