import Alert from '@/components/ui/Alert'
import UserCardGrid from '@/features/user/components/UserCardGrid'
import UserDeleteConfirmDialog from '@/features/user/components/UserDeleteConfirmDialog'
import UserFiltersDialog from '@/features/user/components/UserFiltersDialog'
import UserManagementHeader from '@/features/user/components/UserManagementHeader'
import UserTable from '@/features/user/components/UserTable'
import { useUserDeleteDialog } from '@/features/user/hooks/use-user-delete-dialog'
import { useUserListState } from '@/features/user/hooks/use-user-list-state'
import { ApiError } from '@/features/auth/auth-types'

export default function GerenciarUsuariosPage() {
  const {
    filteredUsers,
    totalCount,
    filteredCount,
    search,
    setSearch,
    filters,
    draftFilters,
    setDraftFilters,
    applyFilters,
    clearFilters,
    viewMode,
    setViewMode,
    isLoading,
    isError,
    error,
    isRefreshing,
    refresh,
    filterDialogOpen,
    openFilterDialog,
    closeFilterDialog,
    handleCreate,
    handleEdit,
  } = useUserListState()

  const deleteDialog = useUserDeleteDialog()

  const errorMessage =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : 'Não foi possível carregar os usuários.'

  return (
    <div className="flex h-full min-h-0 flex-col">
      <UserManagementHeader
        filteredCount={filteredCount}
        totalCount={totalCount}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        onOpenFilters={openFilterDialog}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onCreate={handleCreate}
      />

      <div className="min-h-0 flex-1 overflow-y-auto pt-4">
        {isLoading ? (
          <div className="flex items-center justify-center rounded-lg border border-vscode-border bg-vscode-sidebar px-6 py-16 text-sm text-vscode-text-muted">
            Carregando usuários...
          </div>
        ) : isError ? (
          <Alert variant="error">{errorMessage}</Alert>
        ) : viewMode === 'grid' ? (
          <UserCardGrid
            users={filteredUsers}
            onEdit={handleEdit}
            onDelete={deleteDialog.requestDelete}
            onClearFilters={clearFilters}
          />
        ) : (
          <UserTable
            users={filteredUsers}
            onEdit={handleEdit}
            onDelete={deleteDialog.requestDelete}
            onClearFilters={clearFilters}
          />
        )}
      </div>

      <UserFiltersDialog
        isOpen={filterDialogOpen}
        appliedFilters={filters}
        draftFilters={draftFilters}
        onDraftChange={setDraftFilters}
        onApply={applyFilters}
        onClose={closeFilterDialog}
      />

      <UserDeleteConfirmDialog
        isOpen={deleteDialog.deleteTarget !== null}
        userName={deleteDialog.deleteTarget?.displayName ?? ''}
        isDeleting={deleteDialog.isDeleting}
        error={deleteDialog.error}
        onConfirm={() => void deleteDialog.confirmDelete()}
        onCancel={deleteDialog.cancelDelete}
      />
    </div>
  )
}
