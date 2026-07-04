import Badge from '@/components/ui/Badge'
import { KeyIcon, ShieldIcon } from '@/features/user/components/UserIcons'
import type { ManagedUser } from '@/features/user/user-list-types'

type UserCountBadgesProps = {
  user: ManagedUser
}

function formatCountLabel(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`
}

export default function UserCountBadges({ user }: UserCountBadgesProps) {
  return (
    <div className="flex w-full min-w-0 flex-wrap gap-2">
      <Badge variant="info" icon={<ShieldIcon />}>
        {formatCountLabel(user.regras.length, 'regra', 'regras')}
      </Badge>

      <Badge variant="warning" icon={<KeyIcon />}>
        {formatCountLabel(user.permissoes.length, 'permissão', 'permissões')}
      </Badge>
    </div>
  )
}
