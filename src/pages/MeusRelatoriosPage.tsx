import Alert from '@/components/ui/Alert'
import MyReportCardGrid from '@/features/my-reports/components/MyReportCardGrid'
import MyReportPagination from '@/features/my-reports/components/MyReportPagination'
import MyReportsFiltersDialog from '@/features/my-reports/components/MyReportsFiltersDialog'
import MyReportsHeader from '@/features/my-reports/components/MyReportsHeader'
import MyReportsToolbar from '@/features/my-reports/components/MyReportsToolbar'
import MyReportTable from '@/features/my-reports/components/MyReportTable'
import { useMyReportsState } from '@/features/my-reports/hooks/use-my-reports-state'
import { ApiError } from '@/features/auth/auth-types'

export default function MeusRelatoriosPage() {
  const {
    reports,
    totalCount,
    filteredCount,
    search,
    setSearch,
    filters,
    draftFilters,
    setDraftFilters,
    applyFilters,
    clearFilters,
    toggleFavoritesFilter,
    viewMode,
    setViewMode,
    page,
    pageSize,
    totalPages,
    showPagination,
    goToPreviousPage,
    goToNextPage,
    goToPage,
    onPageSizeChange,
    isLoading,
    isFetching,
    isError,
    error,
    isRefreshing,
    refresh,
    filterDialogOpen,
    openFilterDialog,
    closeFilterDialog,
    isFavorite,
    toggleFavorite,
    togglingFavoriteId,
    favoriteError,
    openReport,
  } = useMyReportsState()

  const errorMessage =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : 'Não foi possível carregar os relatórios.'

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 space-y-4 border-b border-vscode-border bg-vscode-bg pb-4">
        <MyReportsHeader
          filteredCount={filteredCount}
          totalCount={totalCount}
          isRefreshing={isRefreshing}
          onRefresh={() => void refresh()}
        />

        <MyReportsToolbar
          search={search}
          onSearchChange={setSearch}
          filters={filters}
          onOpenFilters={openFilterDialog}
          onToggleFavoritesFilter={toggleFavoritesFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {favoriteError && <Alert variant="error">{favoriteError}</Alert>}
      </div>

      <div
        className={
          viewMode === 'grid'
            ? 'min-h-0 flex-1 space-y-4 overflow-y-auto pt-4'
            : 'flex min-h-0 flex-1 flex-col overflow-hidden pt-4'
        }
      >
        {isError ? (
          <Alert variant="error">{errorMessage}</Alert>
        ) : viewMode === 'grid' ? (
          <>
            {isLoading ? (
              <div className="flex items-center justify-center rounded-xl border border-vscode-border bg-vscode-sidebar px-6 py-20 text-sm text-vscode-text-muted">
                Carregando relatórios...
              </div>
            ) : (
              <MyReportCardGrid
                reports={reports}
                isFavorite={isFavorite}
                togglingFavoriteId={togglingFavoriteId}
                onToggleFavorite={toggleFavorite}
                onOpenReport={openReport}
                onClearFilters={clearFilters}
              />
            )}

            {showPagination && !isLoading && (
              <MyReportPagination
                page={page}
                totalPages={totalPages}
                onPrevious={goToPreviousPage}
                onNext={goToNextPage}
              />
            )}
          </>
        ) : (
          <MyReportTable
            reports={reports}
            total={totalCount}
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            isFavorite={isFavorite}
            togglingFavoriteId={togglingFavoriteId}
            onToggleFavorite={toggleFavorite}
            onOpenReport={openReport}
            onClearFilters={clearFilters}
            onPageChange={goToPage}
            onPageSizeChange={onPageSizeChange}
            isLoading={isLoading}
            isFetching={isFetching}
          />
        )}
      </div>

      <MyReportsFiltersDialog
        isOpen={filterDialogOpen}
        appliedFilters={filters}
        draftFilters={draftFilters}
        onDraftChange={setDraftFilters}
        onApply={applyFilters}
        onClose={closeFilterDialog}
      />
    </div>
  )
}
