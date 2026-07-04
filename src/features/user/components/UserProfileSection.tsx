import SettingsCard from '@/components/settings/SettingsCard'
import SettingsField from '@/components/settings/SettingsField'
import Input from '@/components/ui/Input'
import UserPhotoPanel from '@/features/user/components/UserPhotoPanel'
import type { UserEditDraft } from '@/features/user/user-edit-types'
import type { ManagedUser } from '@/features/user/user-list-types'

type UserProfileSectionProps = {
  user: ManagedUser
  draft: UserEditDraft
  updateDraft: (patch: Partial<UserEditDraft>) => void
}

export default function UserProfileSection({
  user,
  draft,
  updateDraft,
}: UserProfileSectionProps) {
  return (
    <SettingsCard>
      <div className="grid gap-6 lg:grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)] lg:items-start">
        <UserPhotoPanel user={user} />

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SettingsField label="Nome" htmlFor="userEditNome">
              <Input
                id="userEditNome"
                value={draft.nome}
                onChange={(event) => updateDraft({ nome: event.target.value })}
              />
            </SettingsField>

            <SettingsField label="Sobrenome" htmlFor="userEditSobrenome">
              <Input
                id="userEditSobrenome"
                value={draft.sobrenome}
                onChange={(event) => updateDraft({ sobrenome: event.target.value })}
              />
            </SettingsField>
          </div>

          <SettingsField label="E-mail" htmlFor="userEditEmail">
            <Input
              id="userEditEmail"
              type="email"
              value={draft.email}
              onChange={(event) => updateDraft({ email: event.target.value })}
            />
          </SettingsField>

          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-vscode-text">
            <input
              type="checkbox"
              checked={draft.bloqueado}
              onChange={(event) => updateDraft({ bloqueado: event.target.checked })}
              className="h-4 w-4 rounded border-vscode-border accent-vscode-accent"
            />
            Bloqueado
          </label>
        </div>
      </div>
    </SettingsCard>
  )
}
