import Alert from '@/components/ui/Alert'
import MyDashboardCardGrid from '@/features/my-dashboards/components/MyDashboardCardGrid'
import MyDashboardPagination from '@/features/my-dashboards/components/MyDashboardPagination'
import MyDashboardsFiltersDialog from '@/features/my-dashboards/components/MyDashboardsFiltersDialog'
import MyDashboardsHeader from '@/features/my-dashboards/components/MyDashboardsHeader'
import MyDashboardsToolbar from '@/features/my-dashboards/components/MyDashboardsToolbar'
import MyDashboardTable from '@/features/my-dashboards/components/MyDashboardTable'
import { useMyDashboardsState } from '@/features/my-dashboards/hooks/use-my-dashboards-state'
import { ApiError } from '@/features/auth/auth-types'

export default function MeusDashboardsPage() {
  const {
    dashboards,
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
    openDashboard,
  } = useMyDashboardsState()

  const errorMessage =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : 'Não foi possível carregar os dashboards.'

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 space-y-4 border-b border-vscode-border bg-vscode-bg pb-4">
        <MyDashboardsHeader
          filteredCount={filteredCount}
          totalCount={totalCount}
          isRefreshing={isRefreshing}
          onRefresh={() => void refresh()}
        />

        <MyDashboardsToolbar
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
                Carregando dashboards...
              </div>
            ) : (
              <MyDashboardCardGrid
                dashboards={dashboards}
                isFavorite={isFavorite}
                togglingFavoriteId={togglingFavoriteId}
                onToggleFavorite={toggleFavorite}
                onOpenDashboard={openDashboard}
                onClearFilters={clearFilters}
              />
            )}

            {showPagination && !isLoading && (
              <MyDashboardPagination
                page={page}
                totalPages={totalPages}
                onPrevious={goToPreviousPage}
                onNext={goToNextPage}
              />
            )}
          </>
        ) : (
          <MyDashboardTable
            dashboards={dashboards}
            total={totalCount}
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            isFavorite={isFavorite}
            togglingFavoriteId={togglingFavoriteId}
            onToggleFavorite={toggleFavorite}
            onOpenDashboard={openDashboard}
            onClearFilters={clearFilters}
            onPageChange={goToPage}
            onPageSizeChange={onPageSizeChange}
            isLoading={isLoading}
            isFetching={isFetching}
          />
        )}
      </div>

      <MyDashboardsFiltersDialog
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
