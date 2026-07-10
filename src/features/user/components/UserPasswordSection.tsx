import SettingsCard from '@/components/settings/SettingsCard'
import SettingsCardHeader from '@/components/settings/SettingsCardHeader'
import SettingsField from '@/components/settings/SettingsField'
import { LockOpenIcon } from '@/components/settings/SettingsIcons'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import PasswordInput from '@/components/ui/PasswordInput'
import type { UserPasswordDraft, UserPasswordFieldErrors } from '@/features/user/user-edit-types'

type UserPasswordSectionProps = {
  draft: UserPasswordDraft
  updateDraft: (patch: Partial<UserPasswordDraft>) => void
  isDirty: boolean
  fieldErrors: UserPasswordFieldErrors
  isSaving: boolean
  saveSuccess: boolean
  onSave: () => void
  onCancel: () => void
  isAdminEditingOther: boolean
}

export default function UserPasswordSection({
  draft,
  updateDraft,
  isDirty,
  fieldErrors,
  isSaving,
  saveSuccess,
  onSave,
  onCancel,
  isAdminEditingOther,
}: UserPasswordSectionProps) {
  return (
    <SettingsCard>
      <SettingsCardHeader
        icon={<LockOpenIcon />}
        title="Alterar senha"
        description={
          isAdminEditingOther
            ? 'Defina uma nova senha para este usuário.'
            : 'Defina uma nova senha para sua conta.'
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SettingsField label="Nova senha" htmlFor="userEditSenha">
          <PasswordInput
            id="userEditSenha"
            autoComplete="new-password"
            value={draft.senha}
            onChange={(event) => updateDraft({ senha: event.target.value })}
            hasError={Boolean(fieldErrors.senha)}
          />
          {fieldErrors.senha && (
            <p className="text-xs text-vscode-error">{fieldErrors.senha}</p>
          )}
        </SettingsField>

        <SettingsField label="Confirmar senha" htmlFor="userEditConfirmarSenha">
          <PasswordInput
            id="userEditConfirmarSenha"
            autoComplete="new-password"
            value={draft.confirmarSenha}
            onChange={(event) => updateDraft({ confirmarSenha: event.target.value })}
            hasError={Boolean(fieldErrors.confirmarSenha)}
          />
          {fieldErrors.confirmarSenha && (
            <p className="text-xs text-vscode-error">{fieldErrors.confirmarSenha}</p>
          )}
        </SettingsField>
      </div>

      {fieldErrors.general && <Alert variant="error">{fieldErrors.general}</Alert>}

      {saveSuccess && !isDirty && (
        <Alert variant="success">Senha alterada com sucesso.</Alert>
      )}

      {isDirty && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-vscode-border pt-4">
          <Button type="button" loading={isSaving} onClick={onSave}>
            Alterar senha
          </Button>
          <Button type="button" variant="secondary" disabled={isSaving} onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      )}
    </SettingsCard>
  )
}
