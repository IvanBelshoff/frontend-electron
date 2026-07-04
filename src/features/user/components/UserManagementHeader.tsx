import UserPageHeader from '@/features/user/components/UserPageHeader'
import UserToolbar from '@/features/user/components/UserToolbar'
import type { UserViewMode } from '@/features/user/user-list-types'

type UserManagementHeaderProps = {
  filteredCount: number
  totalCount: number
  isRefreshing: boolean
  onRefresh: () => void
  search: string
  onSearchChange: (value: string) => void
  viewMode: UserViewMode
  onViewModeChange: (mode: UserViewMode) => void
  onCreate: () => void
}

export default function UserManagementHeader({
  filteredCount,
  totalCount,
  isRefreshing,
  onRefresh,
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onCreate,
}: UserManagementHeaderProps) {
  return (
    <header className="shrink-0 space-y-4 border-b border-vscode-border bg-vscode-bg pb-4">
      <UserPageHeader
        filteredCount={filteredCount}
        totalCount={totalCount}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
      />

      <UserToolbar
        search={search}
        onSearchChange={onSearchChange}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        onCreate={onCreate}
      />
    </header>
  )
}
