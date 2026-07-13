import { useState } from 'react'
import SettingsField from '@/components/settings/SettingsField'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import PasswordInput from '@/components/ui/PasswordInput'
import { useMyPasswordActions } from '@/features/user-profile/hooks/use-my-password-actions'

type MyProfilePasswordSectionProps = {
  isBlocked: boolean
}

export default function MyProfilePasswordSection({ isBlocked }: MyProfilePasswordSectionProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const passwordActions = useMyPasswordActions({ disabled: isBlocked })

  const handleOpenForm = () => {
    if (isBlocked) {
      return
    }

    setIsFormOpen(true)
  }

  const handleCancel = () => {
    passwordActions.cancelPassword()
    setIsFormOpen(false)
  }

  if (!isFormOpen) {
    return (
      <div className="space-y-3">
        <SettingsField label="Senha" htmlFor="profileSenha">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              id="profileSenha"
              type="password"
              value="••••••••"
              readOnly
              disabled
              className="sm:flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              disabled={isBlocked}
              onClick={handleOpenForm}
              className="shrink-0"
            >
              Trocar senha
            </Button>
          </div>
        </SettingsField>

        {isBlocked && (
          <Alert variant="error">
            Sua conta está bloqueada. Não é possível alterar a senha neste momento.
          </Alert>
        )}

        {passwordActions.saveSuccess && (
          <Alert variant="success">Senha alterada com sucesso.</Alert>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-vscode-text">Alterar senha</h4>
        <p className="mt-1 text-xs text-vscode-text-muted">
          Informe sua senha atual e defina uma nova senha para sua conta.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SettingsField label="Senha atual" htmlFor="profileSenhaAtual">
          <PasswordInput
            id="profileSenhaAtual"
            autoComplete="current-password"
            value={passwordActions.draft.senhaAtual}
            onChange={(event) => passwordActions.updateDraft({ senhaAtual: event.target.value })}
            hasError={Boolean(passwordActions.fieldErrors.senhaAtual)}
            disabled={passwordActions.disabled}
          />
          {passwordActions.fieldErrors.senhaAtual && (
            <p className="text-xs text-vscode-error">{passwordActions.fieldErrors.senhaAtual}</p>
          )}
        </SettingsField>

        <div className="hidden sm:block" />

        <SettingsField label="Nova senha" htmlFor="profileNovaSenha">
          <PasswordInput
            id="profileNovaSenha"
            autoComplete="new-password"
            value={passwordActions.draft.senha}
            onChange={(event) => passwordActions.updateDraft({ senha: event.target.value })}
            hasError={Boolean(passwordActions.fieldErrors.senha)}
            disabled={passwordActions.disabled}
          />
          {passwordActions.fieldErrors.senha && (
            <p className="text-xs text-vscode-error">{passwordActions.fieldErrors.senha}</p>
          )}
        </SettingsField>

        <SettingsField label="Confirmar nova senha" htmlFor="profileConfirmarSenha">
          <PasswordInput
            id="profileConfirmarSenha"
            autoComplete="new-password"
            value={passwordActions.draft.confirmarSenha}
            onChange={(event) =>
              passwordActions.updateDraft({ confirmarSenha: event.target.value })
            }
            hasError={Boolean(passwordActions.fieldErrors.confirmarSenha)}
            disabled={passwordActions.disabled}
          />
          {passwordActions.fieldErrors.confirmarSenha && (
            <p className="text-xs text-vscode-error">
              {passwordActions.fieldErrors.confirmarSenha}
            </p>
          )}
        </SettingsField>
      </div>

      {passwordActions.fieldErrors.general && (
        <Alert variant="error">{passwordActions.fieldErrors.general}</Alert>
      )}

      {passwordActions.saveSuccess && !passwordActions.isDirty && (
        <Alert variant="success">Senha alterada com sucesso.</Alert>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          loading={passwordActions.isSaving}
          disabled={passwordActions.disabled || !passwordActions.isDirty}
          onClick={() => {
            void passwordActions.savePassword().then((saved) => {
              if (saved) {
                setIsFormOpen(false)
              }
            })
          }}
        >
          Alterar senha
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={passwordActions.isSaving}
          onClick={handleCancel}
        >
          Cancelar
        </Button>
      </div>
    </div>
  )
}
