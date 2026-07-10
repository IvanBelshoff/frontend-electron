import SettingsCard from '@/components/settings/SettingsCard'
import SettingsField from '@/components/settings/SettingsField'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import UserPhotoPanel from '@/features/user/components/UserPhotoPanel'
import type { UserEditDraft, UserFieldErrors } from '@/features/user/user-edit-types'
import type { ManagedUser } from '@/features/user/user-list-types'

type UserProfileSectionProps = {
  user: ManagedUser
  draft: UserEditDraft
  updateDraft: (patch: Partial<UserEditDraft>) => void
  isDirty: boolean
  fieldErrors: UserFieldErrors
  isSaving: boolean
  saveSuccess: boolean
  onSave: () => void
  onCancel: () => void
  canUpdate?: boolean
}

export default function UserProfileSection({
  user,
  draft,
  updateDraft,
  isDirty,
  fieldErrors,
  isSaving,
  saveSuccess,
  onSave,
  onCancel,
  canUpdate = true,
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
                hasError={Boolean(fieldErrors.nome)}
                disabled={!canUpdate}
              />
              {fieldErrors.nome && (
                <p className="text-xs text-vscode-error">{fieldErrors.nome}</p>
              )}
            </SettingsField>

            <SettingsField label="Sobrenome" htmlFor="userEditSobrenome">
              <Input
                id="userEditSobrenome"
                value={draft.sobrenome}
                onChange={(event) => updateDraft({ sobrenome: event.target.value })}
                hasError={Boolean(fieldErrors.sobrenome)}
                disabled={!canUpdate}
              />
              {fieldErrors.sobrenome && (
                <p className="text-xs text-vscode-error">{fieldErrors.sobrenome}</p>
              )}
            </SettingsField>
          </div>

          <SettingsField label="E-mail" htmlFor="userEditEmail">
            <Input
              id="userEditEmail"
              type="email"
              value={draft.email}
              onChange={(event) => updateDraft({ email: event.target.value })}
              hasError={Boolean(fieldErrors.email)}
              disabled={!canUpdate}
            />
            {fieldErrors.email && (
              <p className="text-xs text-vscode-error">{fieldErrors.email}</p>
            )}
          </SettingsField>

          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-vscode-text">
            <input
              type="checkbox"
              checked={draft.bloqueado}
              onChange={(event) => updateDraft({ bloqueado: event.target.checked })}
              disabled={!canUpdate}
              className="h-4 w-4 rounded border-vscode-border accent-vscode-accent disabled:opacity-50"
            />
            Bloqueado
          </label>

          {fieldErrors.general && <Alert variant="error">{fieldErrors.general}</Alert>}

          {saveSuccess && !isDirty && (
            <Alert variant="success">Usuário salvo com sucesso.</Alert>
          )}

          {isDirty && canUpdate && (
            <div className="flex flex-wrap gap-2 border-t border-vscode-border pt-4">
              <Button type="button" loading={isSaving} onClick={onSave}>
                Salvar
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={isSaving}
                onClick={onCancel}
              >
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </div>
    </SettingsCard>
  )
}
