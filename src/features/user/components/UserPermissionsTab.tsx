import Alert from '@/components/ui/Alert'
import UserPermissionsEditorSection from '@/features/user/components/UserPermissionsEditorSection'
import UserPermissionsSummarySection from '@/features/user/components/UserPermissionsSummarySection'
import { useUserPermissionsEditState } from '@/features/user/hooks/use-user-permissions-edit-state'
import { BLOCKED_USER_PERMISSIONS_MESSAGE } from '@/features/user/user-blocked-messages'
import { isManagedUserBlocked } from '@/features/user/user-blocked-utils'
import type { ManagedUser } from '@/features/user/user-list-types'
import { ApiError } from '@/features/auth/auth-types'

type UserPermissionsTabProps = {
  user: ManagedUser
}

export default function UserPermissionsTab({ user }: UserPermissionsTabProps) {
  const permissionsState = useUserPermissionsEditState(user)
  const isUserBlocked = isManagedUserBlocked(user)

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

  if (isUserBlocked) {
    return (
      <div className="space-y-4">
        <Alert variant="info">{BLOCKED_USER_PERMISSIONS_MESSAGE}</Alert>
        <UserPermissionsSummarySection
          catalog={permissionsState.catalog}
          initialRuleIds={permissionsState.initialRuleIds}
          initialPermissionIds={permissionsState.initialPermissionIds}
        />
      </div>
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
        isUserBlocked={permissionsState.isUserBlocked}
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
