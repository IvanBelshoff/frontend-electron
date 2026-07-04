import Button from '@/components/ui/Button'
import SettingsField from '@/components/settings/SettingsField'
import type { ManagedUser } from '@/features/user/user-list-types'
import { getUserDisplayName } from '@/features/user/user-list-types'
import UserAvatar from '@/features/user/UserAvatar'
import { PlusIcon, TrashIcon } from '@/features/dashboards/icons/DashboardIcons'

type UserPhotoPanelProps = {
  user: ManagedUser
}

export default function UserPhotoPanel({ user }: UserPhotoPanelProps) {
  const displayName = getUserDisplayName(user)

  return (
    <div className="flex flex-col items-center text-center">
      <span className="mb-3 text-xs font-semibold uppercase tracking-wide text-vscode-text-muted">
        Foto do usuário
      </span>

      <UserAvatar
        userId={user.id}
        nome={user.nome}
        sobrenome={user.sobrenome}
        foto={user.foto}
        className="h-24 w-24 text-2xl"
      />

      <p className="mt-3 text-sm font-semibold text-vscode-text">{displayName}</p>

      <div className="mt-4 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled
          className="border-red-400/40 text-red-400"
        >
          <TrashIcon />
          Excluir foto
        </Button>

        <Button type="button" variant="primary" size="sm" disabled>
          <PlusIcon />
          Alterar foto
        </Button>
      </div>

      <p className="mt-3 text-xs text-vscode-text-muted">
        Formatos aceitos: JPG, PNG ou GIF (até 8 MB).
      </p>
    </div>
  )
}
