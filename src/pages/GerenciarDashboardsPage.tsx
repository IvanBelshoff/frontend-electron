import Alert from '@/components/ui/Alert'
import DashboardCardGrid from '@/features/dashboards/components/DashboardCardGrid'
import DashboardDeleteConfirmDialog from '@/features/dashboards/components/DashboardDeleteConfirmDialog'
import DashboardFiltersDialog from '@/features/dashboards/components/DashboardFiltersDialog'
import DashboardManagementHeader from '@/features/dashboards/components/DashboardManagementHeader'
import DashboardTable from '@/features/dashboards/components/DashboardTable'
import { useDashboardDeleteDialog } from '@/features/dashboards/hooks/use-dashboard-delete-dialog'
import { useDashboardListState } from '@/features/dashboards/hooks/use-dashboard-list-state'
import { ApiError } from '@/features/auth/auth-types'

export default function GerenciarDashboardsPage() {
  const {
    filteredDashboards,
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
  } = useDashboardListState()

  const deleteDialog = useDashboardDeleteDialog()

  const errorMessage =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : 'Não foi possível carregar os dashboards.'

  return (
    <div className="flex h-full min-h-0 flex-col">
      <DashboardManagementHeader
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
            Carregando dashboards...
          </div>
        ) : isError ? (
          <Alert variant="error">{errorMessage}</Alert>
        ) : viewMode === 'grid' ? (
          <DashboardCardGrid
            dashboards={filteredDashboards}
            onEdit={handleEdit}
            onDelete={deleteDialog.requestDelete}
            onClearFilters={clearFilters}
          />
        ) : (
          <DashboardTable
            dashboards={filteredDashboards}
            onEdit={handleEdit}
            onDelete={deleteDialog.requestDelete}
            onClearFilters={clearFilters}
          />
        )}
      </div>

      <DashboardFiltersDialog
        isOpen={filterDialogOpen}
        appliedFilters={filters}
        draftFilters={draftFilters}
        onDraftChange={setDraftFilters}
        onApply={applyFilters}
        onClose={closeFilterDialog}
      />

      <DashboardDeleteConfirmDialog
        isOpen={deleteDialog.deleteTarget !== null}
        dashboardName={deleteDialog.deleteTarget?.nome ?? ''}
        isDeleting={deleteDialog.isDeleting}
        error={deleteDialog.error}
        onConfirm={() => void deleteDialog.confirmDelete()}
        onCancel={deleteDialog.cancelDelete}
      />
    </div>
  )
}
