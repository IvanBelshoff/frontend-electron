import Alert from '@/components/ui/Alert'
import ConnectionDeleteConfirmDialog from '@/features/connections/components/ConnectionDeleteConfirmDialog'
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
    setFilters,
    clearFilters,
    isLoading,
    isError,
    error,
    isRefreshing,
    refresh,
    handleCreate,
    handleEdit,
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
        onFiltersChange={setFilters}
        onCreate={handleCreate}
      />

      <div className="min-h-0 flex-1 overflow-y-auto pt-4">
        {isLoading ? (
          <div className="flex items-center justify-center rounded-lg border border-vscode-border bg-vscode-sidebar px-6 py-16 text-sm text-vscode-text-muted">
            Carregando conexões...
          </div>
        ) : isError ? (
          <Alert variant="error">{errorMessage}</Alert>
        ) : (
          <ConnectionTable
            connections={filteredConnections}
            onEdit={handleEdit}
            onDelete={deleteDialog.requestDelete}
            onClearFilters={clearFilters}
          />
        )}
      </div>

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
