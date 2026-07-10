import type { UserEditDraft } from '@/features/user/user-edit-types'
import type { ManagedUser } from '@/features/user/user-list-types'

export function isManagedUserBlocked(
  user: Pick<ManagedUser, 'bloqueado'> | null | undefined,
  originalDraft?: UserEditDraft | null,
): boolean {
  if (user?.bloqueado) {
    return true
  }

  return Boolean(originalDraft?.bloqueado)
}
