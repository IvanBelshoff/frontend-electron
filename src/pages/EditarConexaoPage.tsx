import { Link, useParams } from '@tanstack/react-router'
import { RefreshIcon } from '@/components/settings/SettingsIcons'
import SettingsCard from '@/components/settings/SettingsCard'
import SettingsCardHeader from '@/components/settings/SettingsCardHeader'
import SettingsInfoGrid from '@/components/settings/SettingsInfoGrid'
import { InfoIcon } from '@/components/settings/SettingsIcons'
import Alert from '@/components/ui/Alert'
import IconButton from '@/components/ui/IconButton'
import { hasPermission } from '@/features/auth/rbac'
import { CONNECTION_RBAC } from '@/features/auth/rbac-requirements'
import { useRbac } from '@/features/auth/use-rbac'
import ConnectionDeleteConfirmDialog from '@/features/connections/components/ConnectionDeleteConfirmDialog'
import ConnectionForm from '@/features/connections/components/ConnectionForm'
import ConnectionTestButton from '@/features/connections/components/ConnectionTestButton'
import { useConnectionDeleteDialog } from '@/features/connections/hooks/use-connection-delete-dialog'
import { useConnectionEditState } from '@/features/connections/hooks/use-connection-edit-state'
import { ApiError } from '@/features/auth/auth-types'
import { formatDashboardDate } from '@/features/dashboards/format-dashboard-date'
import { TrashIcon } from '@/features/dashboards/icons/DashboardIcons'

export default function EditarConexaoPage() {
  const { conexaoId: conexaoIdParam } = useParams({ strict: false })
  const connectionId = Number(conexaoIdParam)
  const rbac = useRbac()
  const canUpdate = hasPermission(rbac, CONNECTION_RBAC.update)
  const canDelete = hasPermission(rbac, CONNECTION_RBAC.delete)

  const {
    connection,
    draft,
    updateDraft,
    isDirty,
    fieldErrors,
    saveSuccess,
    saveEdit,
    cancelEdit,
    refresh,
    isLoading,
    isError,
    error,
    isSaving,
    isRefreshing,
  } = useConnectionEditState(connectionId)

  const deleteDialog = useConnectionDeleteDialog({ redirectToListOnSuccess: true })

  const errorMessage =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : 'Não foi possível carregar a conexão.'

  const isNotFound =
    error instanceof ApiError && (error.statusCode === 404 || error.statusCode === 403)

  if (!Number.isFinite(connectionId) || connectionId <= 0) {
    return (
      <div className="space-y-4">
        <Alert variant="error">Identificador de conexão inválido.</Alert>
        <Link to="/conexoes" className="text-sm text-vscode-accent hover:underline">
          Voltar para a listagem
        </Link>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 space-y-4 border-b border-vscode-border bg-vscode-bg pb-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Breadcrumb" className="min-w-0 text-sm text-vscode-text-muted">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link to="/conexoes" className="transition-colors hover:text-vscode-text">
                  Gerenciamento de Conexões
                </Link>
              </li>
              <li aria-hidden="true" className="text-vscode-text-muted">
                /
              </li>
              <li className="truncate font-medium text-vscode-text" aria-current="page">
                {connection?.nome ?? 'Carregando...'}
              </li>
            </ol>
          </nav>

          <div className="flex items-center gap-2">
            <IconButton
              icon={
                isRefreshing ? (
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
                    aria-hidden="true"
                  />
                ) : (
                  <RefreshIcon />
                )
              }
              label="Atualizar conexão"
              title="Atualizar conexão"
              onClick={refresh}
              disabled={isRefreshing}
              className="h-9 w-9 rounded-full border border-vscode-border text-emerald-400 hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-emerald-300 disabled:opacity-50"
            />

            <IconButton
              icon={<TrashIcon className="h-4 w-4" />}
              label="Excluir conexão"
              title={
                canDelete ? 'Excluir conexão' : 'Você não possui permissão para excluir conexões.'
              }
              onClick={() => {
                if (connection) {
                  deleteDialog.requestDelete(connection)
                }
              }}
              disabled={!canDelete}
              className="h-9 w-9 rounded-full border border-vscode-border text-red-400 hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300 disabled:opacity-40"
            />
          </div>
        </header>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pt-4">
        {isLoading ? (
          <div className="flex items-center justify-center rounded-lg border border-vscode-border bg-vscode-sidebar px-6 py-16 text-sm text-vscode-text-muted">
            Carregando conexão...
          </div>
        ) : isError || !connection || !draft ? (
          <div className="space-y-4">
            <Alert variant="error">
              {isNotFound ? 'Conexão não encontrada ou sem permissão.' : errorMessage}
            </Alert>
            <Link to="/conexoes" className="text-sm text-vscode-accent hover:underline">
              Voltar para a listagem
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <ConnectionForm
              draft={draft}
              updateDraft={updateDraft}
              fieldErrors={fieldErrors}
              isDirty={isDirty}
              isSaving={isSaving}
              saveSuccess={saveSuccess}
              onSave={() => void saveEdit()}
              onCancel={cancelEdit}
              canUpdate={canUpdate}
            />

            <SettingsCard>
              <SettingsCardHeader
                icon={<InfoIcon />}
                title="Testar conexão"
                description="Verifique se as credenciais e parâmetros estão corretos."
              />
              <ConnectionTestButton connectionId={connectionId} />
            </SettingsCard>

            <SettingsCard>
              <SettingsCardHeader
                icon={<InfoIcon />}
                title="Informações da conexão"
                description="Resumo de rastreabilidade."
              />

              <SettingsInfoGrid
                items={[
                  {
                    label: 'Criado por',
                    value: connection.usuarioCadastrador ?? '—',
                  },
                  {
                    label: 'Atualizado por',
                    value: connection.usuarioAtualizador ?? '—',
                  },
                  {
                    label: 'Data de criação',
                    value: formatDashboardDate(connection.dataCriacao),
                  },
                  {
                    label: 'Data de atualização',
                    value: formatDashboardDate(connection.dataAtualizacao),
                  },
                ]}
              />
            </SettingsCard>
          </div>
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
