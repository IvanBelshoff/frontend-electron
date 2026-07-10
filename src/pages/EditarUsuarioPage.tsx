import { Link, useParams } from '@tanstack/react-router'
import Alert from '@/components/ui/Alert'
import { useAuth } from '@/features/auth/use-auth'
import { canChangeUserPassword, hasAnyPermission, hasPermission, hasRole, isAdmin } from '@/features/auth/rbac'
import { USER_RBAC } from '@/features/auth/rbac-requirements'
import { useRbac } from '@/features/auth/use-rbac'
import UserDeleteConfirmDialog from '@/features/user/components/UserDeleteConfirmDialog'
import UserEditHeader from '@/features/user/components/UserEditHeader'
import UserAccessTab from '@/features/user/components/UserAccessTab'
import UserPermissionsTab from '@/features/user/components/UserPermissionsTab'
import UserEditTabs from '@/features/user/components/UserEditTabs'
import UserInfoSection from '@/features/user/components/UserInfoSection'
import UserPasswordSection from '@/features/user/components/UserPasswordSection'
import UserProfileSection from '@/features/user/components/UserProfileSection'
import { useUserDeleteDialog } from '@/features/user/hooks/use-user-delete-dialog'
import { useUserEditState } from '@/features/user/hooks/use-user-edit-state'
import { useUserPasswordState } from '@/features/user/hooks/use-user-password-state'
import { getUserDisplayName } from '@/features/user/user-list-types'
import { ApiError } from '@/features/auth/auth-types'

export default function EditarUsuarioPage() {
  const { userId: userIdParam } = useParams({ strict: false })
  const userId = Number(userIdParam)
  const { user: authUser } = useAuth()
  const rbac = useRbac()

  const canUpdate = hasPermission(rbac, USER_RBAC.update)
  const canDelete = hasPermission(rbac, USER_RBAC.delete)
  const canManagePermissions = hasRole(rbac, USER_RBAC.permissionsTabRole)
  const canManageDashboardAccess = hasPermission(rbac, USER_RBAC.grantDashboardAccess)
  const canManageReportAccess = hasPermission(rbac, USER_RBAC.grantReportAccess)
  const canManageAccess = hasAnyPermission(rbac, [...USER_RBAC.grantAccessPermissions])
  const canChangePassword = canChangeUserPassword(rbac, authUser?.sub, userId)

  const {
    user,
    draft,
    activeTab,
    setActiveTab,
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
  } = useUserEditState(userId)

  const passwordState = useUserPasswordState(userId)

  const deleteDialog = useUserDeleteDialog({ redirectToListOnSuccess: true })

  const errorMessage =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : 'Não foi possível carregar o usuário.'

  const isNotFound =
    error instanceof ApiError && (error.statusCode === 404 || error.statusCode === 403)

  if (!Number.isFinite(userId) || userId <= 0) {
    return (
      <div className="space-y-4">
        <Alert variant="error">Identificador de usuário inválido.</Alert>
        <Link to="/usuarios" className="text-sm text-vscode-accent hover:underline">
          Voltar para a listagem
        </Link>
      </div>
    )
  }

  const displayName = user ? getUserDisplayName(user) : 'Carregando...'

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 space-y-4 border-b border-vscode-border bg-vscode-bg pb-4">
        <UserEditHeader
          userName={displayName}
          isRefreshing={isRefreshing}
          onRefresh={refresh}
          onDelete={() => {
            if (user) {
              deleteDialog.requestDelete(user)
            }
          }}
          canDelete={canDelete}
        />

        <UserEditTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          hiddenTabs={canManagePermissions ? [] : ['permissions']}
          disabledTabs={canManageAccess ? [] : ['access']}
        />
      </div>

      <div
        className={
          activeTab === 'access'
            ? 'flex min-h-0 flex-1 flex-col overflow-hidden pt-4'
            : 'min-h-0 flex-1 overflow-y-auto pt-4'
        }
      >
        {isLoading ? (
          <div className="flex items-center justify-center rounded-lg border border-vscode-border bg-vscode-sidebar px-6 py-16 text-sm text-vscode-text-muted">
            Carregando usuário...
          </div>
        ) : isError || !user || !draft ? (
          <div className="space-y-4">
            <Alert variant="error">
              {isNotFound ? 'Usuário não encontrado ou sem permissão.' : errorMessage}
            </Alert>
            <Link to="/usuarios" className="text-sm text-vscode-accent hover:underline">
              Voltar para a listagem
            </Link>
          </div>
        ) : activeTab === 'user' ? (
          <div className="space-y-4">
            <UserProfileSection
              user={user}
              draft={draft}
              updateDraft={updateDraft}
              isDirty={isDirty}
              fieldErrors={fieldErrors}
              isSaving={isSaving}
              saveSuccess={saveSuccess}
              onSave={() => void saveEdit()}
              onCancel={cancelEdit}
              canUpdate={canUpdate}
            />
            {canChangePassword && (
              <UserPasswordSection
                draft={passwordState.draft}
                updateDraft={passwordState.updateDraft}
                isDirty={passwordState.isDirty}
                fieldErrors={passwordState.fieldErrors}
                isSaving={passwordState.isSaving}
                saveSuccess={passwordState.saveSuccess}
                onSave={() => void passwordState.savePassword()}
                onCancel={passwordState.cancelPassword}
                isAdminEditingOther={isAdmin(rbac) && authUser?.sub !== userId}
              />
            )}
            <UserInfoSection user={user} />
          </div>
        ) : activeTab === 'permissions' ? (
          <UserPermissionsTab user={user} />
        ) : activeTab === 'access' ? (
          canManageAccess ? (
            <UserAccessTab
              user={user}
              enabled={activeTab === 'access'}
              canManageDashboardAccess={canManageDashboardAccess}
              canManageReportAccess={canManageReportAccess}
            />
          ) : (
            <Alert variant="warning">
              Você não possui permissão para gerenciar acessos deste usuário.
            </Alert>
          )
        ) : null}
      </div>

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
