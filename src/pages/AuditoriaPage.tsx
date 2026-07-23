import SettingsPageHeader from '@/components/settings/SettingsPageHeader'
import { RefreshIcon } from '@/components/settings/SettingsIcons'
import Alert from '@/components/ui/Alert'
import IconButton from '@/components/ui/IconButton'
import AuditFiltersDialog from '@/features/audit/components/AuditFiltersDialog'
import AuditLogDetailDrawer from '@/features/audit/components/AuditLogDetailDrawer'
import AuditLogsTable from '@/features/audit/components/AuditLogsTable'
import AuditToolbar from '@/features/audit/components/AuditToolbar'
import { useAdminAuditState } from '@/features/audit/hooks/use-admin-audit-state'
import type { AuditLogListItem } from '@/features/audit/audit-types'
import { ApiError } from '@/features/auth/auth-types'

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

export default function AuditoriaPage() {
  const {
    logs,
    total,
    page,
    pageSize,
    totalPages,
    appliedFilters,
    draftFilters,
    setDraftFilters,
    quickSearch,
    setQuickSearch,
    activeAdvancedFilterCount,
    actions,
    applyFilters,
    removeAdvancedFilter,
    goToPage,
    setPageSize,
    sorting,
    onSortingChange,
    refresh,
    filterDialogOpen,
    openFilterDialog,
    closeFilterDialog,
    isLoading,
    isFetching,
    isError,
    error,
    selectedLogId,
    selectedLog,
    isDetailLoading,
    isDetailError,
    detailError,
    openLogDetail,
    closeLogDetail,
  } = useAdminAuditState()

  const handleRowClick = (log: AuditLogListItem) => {
    openLogDetail(log.id)
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-wrap items-start justify-between gap-3">
        <SettingsPageHeader
          title="Auditoria"
          subtitle="Rastreie ações de usuários, autenticação e alterações administrativas."
        />

        <IconButton
          icon={
            isFetching ? (
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
                aria-hidden="true"
              />
            ) : (
              <RefreshIcon />
            )
          }
          label="Atualizar auditoria"
          title="Atualizar"
          onClick={refresh}
          disabled={isFetching}
        />
      </div>

      <div className="shrink-0 pt-6">
        <AuditToolbar
          appliedFilters={appliedFilters}
          quickSearch={quickSearch}
          activeAdvancedFilterCount={activeAdvancedFilterCount}
          onQuickSearchChange={setQuickSearch}
          onOpenFilters={openFilterDialog}
          onRemoveFilter={removeAdvancedFilter}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col pt-4">
        {isError ? (
          <Alert variant="error">
            {getErrorMessage(error, 'Não foi possível carregar os logs de auditoria.')}
          </Alert>
        ) : (
          <AuditLogsTable
            logs={logs}
            total={total}
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            isLoading={isLoading}
            isFetching={isFetching}
            onRowClick={handleRowClick}
            onPageChange={goToPage}
            onPageSizeChange={setPageSize}
            sorting={sorting}
            onSortingChange={onSortingChange}
            className="min-h-0 flex-1"
          />
        )}
      </div>

      <AuditFiltersDialog
        isOpen={filterDialogOpen}
        draftFilters={draftFilters}
        actions={actions}
        activeAdvancedFilterCount={activeAdvancedFilterCount}
        onDraftChange={setDraftFilters}
        onApply={applyFilters}
        onClose={closeFilterDialog}
      />

      <AuditLogDetailDrawer
        isOpen={selectedLogId != null}
        log={selectedLog}
        isLoading={isDetailLoading}
        isError={isDetailError}
        errorMessage={
          isDetailError
            ? getErrorMessage(detailError, 'Não foi possível carregar o detalhe do log.')
            : undefined
        }
        onClose={closeLogDetail}
      />
    </div>
  )
}
