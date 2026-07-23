import type { ManagedUser } from '@/features/user/user-list-types'

export function hasUserAccessData(user: ManagedUser): boolean {
  return (
    user.regras.length > 0 ||
    user.permissoes.length > 0 ||
    user.permissoesDetalhadas.length > 0
  )
}
