import Alert from '@/components/ui/Alert'
import ReportCardGrid from '@/features/reports/components/ReportCardGrid'
import ReportDeleteConfirmDialog from '@/features/reports/components/ReportDeleteConfirmDialog'
import ReportFiltersDialog from '@/features/reports/components/ReportFiltersDialog'
import ReportManagementHeader from '@/features/reports/components/ReportManagementHeader'
import ReportTable from '@/features/reports/components/ReportTable'
import { useReportDeleteDialog } from '@/features/reports/hooks/use-report-delete-dialog'
import { useReportListState } from '@/features/reports/hooks/use-report-list-state'
import { ApiError } from '@/features/auth/auth-types'

export default function GerenciarRelatoriosPage() {
  const {
    filteredReports,
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
  } = useReportListState()

  const deleteDialog = useReportDeleteDialog()

  const errorMessage =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : 'Não foi possível carregar os relatórios.'

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ReportManagementHeader
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
            Carregando relatórios...
          </div>
        ) : isError ? (
          <Alert variant="error">{errorMessage}</Alert>
        ) : viewMode === 'grid' ? (
          <ReportCardGrid
            reports={filteredReports}
            onEdit={handleEdit}
            onDelete={deleteDialog.requestDelete}
            onClearFilters={clearFilters}
          />
        ) : (
          <ReportTable
            reports={filteredReports}
            onEdit={handleEdit}
            onDelete={deleteDialog.requestDelete}
            onClearFilters={clearFilters}
          />
        )}
      </div>

      <ReportFiltersDialog
        isOpen={filterDialogOpen}
        appliedFilters={filters}
        draftFilters={draftFilters}
        onDraftChange={setDraftFilters}
        onApply={applyFilters}
        onClose={closeFilterDialog}
      />

      <ReportDeleteConfirmDialog
        isOpen={deleteDialog.deleteTarget !== null}
        reportName={deleteDialog.deleteTarget?.nome ?? ''}
        isDeleting={deleteDialog.isDeleting}
        error={deleteDialog.error}
        onConfirm={() => void deleteDialog.confirmDelete()}
        onCancel={deleteDialog.cancelDelete}
      />
    </div>
  )
}
