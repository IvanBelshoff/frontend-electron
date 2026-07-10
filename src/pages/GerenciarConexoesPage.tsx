import Alert from '@/components/ui/Alert'
import ConnectionCardGrid from '@/features/connections/components/ConnectionCardGrid'
import ConnectionDeleteConfirmDialog from '@/features/connections/components/ConnectionDeleteConfirmDialog'
import ConnectionFiltersDialog from '@/features/connections/components/ConnectionFiltersDialog'
import ConnectionManagementHeader from '@/features/connections/components/ConnectionManagementHeader'
import ConnectionTable from '@/features/connections/components/ConnectionTable'
import { useConnectionDeleteDialog } from '@/features/connections/hooks/use-connection-delete-dialog'
import { useConnectionListState } from '@/features/connections/hooks/use-connection-list-state'
import { ApiError } from '@/features/auth/auth-types'

export default function GerenciarConexoesPage() {
  const {
    filteredConnections,
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
    canCreate,
    canEdit,
    canDelete,
  } = useConnectionListState()

  const deleteDialog = useConnectionDeleteDialog()

  const errorMessage =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : 'Não foi possível carregar as conexões.'

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ConnectionManagementHeader
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
        canCreate={canCreate}
      />

      <div className="min-h-0 flex-1 overflow-y-auto pt-4">
        {isLoading ? (
          <div className="flex items-center justify-center rounded-lg border border-vscode-border bg-vscode-sidebar px-6 py-16 text-sm text-vscode-text-muted">
            Carregando conexões...
          </div>
        ) : isError ? (
          <Alert variant="error">{errorMessage}</Alert>
        ) : viewMode === 'grid' ? (
          <ConnectionCardGrid
            connections={filteredConnections}
            onEdit={handleEdit}
            onDelete={deleteDialog.requestDelete}
            onClearFilters={clearFilters}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        ) : (
          <ConnectionTable
            connections={filteredConnections}
            onEdit={handleEdit}
            onDelete={deleteDialog.requestDelete}
            onClearFilters={clearFilters}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        )}
      </div>

      <ConnectionFiltersDialog
        isOpen={filterDialogOpen}
        appliedFilters={filters}
        draftFilters={draftFilters}
        onDraftChange={setDraftFilters}
        onApply={applyFilters}
        onClose={closeFilterDialog}
      />

      <ConnectionDeleteConfirmDialog
        isOpen={deleteDialog.deleteTarget !== null}
        connectionName={deleteDialog.deleteTarget?.nome ?? ''}
        isDeleting={deleteDialog.isDeleting}
        error={deleteDialog.error}
        onConfirm={() => void deleteDialog.confirmDelete()}
        onCancel={deleteDialog.cancelDelete}
      />
    </div>
  )
}
