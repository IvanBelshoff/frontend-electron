import Badge from '@/components/ui/Badge'
import { CheckIcon } from '@/components/settings/SettingsIcons'
import { LockIcon } from '@/features/dashboards/icons/DashboardIcons'
import type { ManagedUser } from '@/features/user/user-list-types'

type UserStatusBadgeProps = {
  bloqueado: ManagedUser['bloqueado']
}

export default function UserStatusBadge({ bloqueado }: UserStatusBadgeProps) {
  if (bloqueado) {
    return (
      <Badge variant="danger" icon={<LockIcon />}>
        Bloqueado
      </Badge>
    )
  }

  return (
    <Badge variant="success" icon={<CheckIcon />}>
      Ativo
    </Badge>
  )
}
