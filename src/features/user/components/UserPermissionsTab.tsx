import Alert from '@/components/ui/Alert'
import UserPermissionsEditorSection from '@/features/user/components/UserPermissionsEditorSection'
import UserPermissionsSummarySection from '@/features/user/components/UserPermissionsSummarySection'
import { useUserPermissionsEditState } from '@/features/user/hooks/use-user-permissions-edit-state'
import type { ManagedUser } from '@/features/user/user-list-types'
import { ApiError } from '@/features/auth/auth-types'

type UserPermissionsTabProps = {
  user: ManagedUser
}

export default function UserPermissionsTab({ user }: UserPermissionsTabProps) {
  const permissionsState = useUserPermissionsEditState(user)

  const errorMessage =
    permissionsState.error instanceof ApiError
      ? permissionsState.error.message
      : permissionsState.error instanceof Error
        ? permissionsState.error.message
        : 'Não foi possível carregar o catálogo de regras e permissões.'

  const isForbidden =
    permissionsState.error instanceof ApiError && permissionsState.error.statusCode === 403

  if (!permissionsState.canEdit && permissionsState.isError) {
    return (
      <Alert variant="error">
        {isForbidden
          ? 'Você não possui permissão para gerenciar regras e permissões de usuários.'
          : errorMessage}
      </Alert>
    )
  }

  return (
    <div className="grid min-h-0 gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,7fr)] lg:items-start">
      <UserPermissionsSummarySection
        catalog={permissionsState.catalog}
        initialRuleIds={permissionsState.initialRuleIds}
        initialPermissionIds={permissionsState.initialPermissionIds}
      />

      <UserPermissionsEditorSection
        catalog={permissionsState.catalog}
        selectedRuleIds={permissionsState.selectedRuleIds}
        selectedPermissionIds={permissionsState.selectedPermissionIds}
        expandedRuleIds={permissionsState.expandedRuleIds}
        isDirty={permissionsState.isDirty}
        isAdminLockActive={permissionsState.isAdminLockActive}
        isSaving={permissionsState.isSaving}
        saveSuccess={permissionsState.saveSuccess}
        saveError={permissionsState.saveError}
        isLoading={permissionsState.isLoading}
        isError={permissionsState.isError}
        errorMessage={errorMessage}
        onToggleAccordion={permissionsState.toggleAccordion}
        onToggleRule={permissionsState.toggleRule}
        onTogglePermission={permissionsState.togglePermission}
        onReset={permissionsState.resetSelection}
        onSave={() => void permissionsState.saveSelection()}
        onRetry={() => void permissionsState.refreshCatalog()}
      />
    </div>
  )
}
