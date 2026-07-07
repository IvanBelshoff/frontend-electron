import { Link } from '@tanstack/react-router'
import SettingsCard from '@/components/settings/SettingsCard'
import SettingsField from '@/components/settings/SettingsField'
import SettingsSelect from '@/components/settings/SettingsSelect'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import UserCreatePhotoPanel from '@/features/user/components/UserCreatePhotoPanel'
import type {
  UserCreateDraft,
  UserCreateFieldErrors,
  UserSummaryOption,
} from '@/features/user/user-create-types'

type UserCreateFormProps = {
  draft: UserCreateDraft
  updateDraft: (patch: Partial<UserCreateDraft>) => void
  fieldErrors: UserCreateFieldErrors
  photoPreviewUrl: string | null
  onPhotoChange: (photo: Blob | null, previewUrl: string | null) => void
  userOptions: UserSummaryOption[]
  isLoadingUserOptions: boolean
  isSaving: boolean
  createdUserId: number | null
  onSaveToList: () => void
  onSaveAndEdit: () => void
}

export default function UserCreateForm({
  draft,
  updateDraft,
  fieldErrors,
  photoPreviewUrl,
  onPhotoChange,
  userOptions,
  isLoadingUserOptions,
  isSaving,
  createdUserId,
  onSaveToList,
  onSaveAndEdit,
}: UserCreateFormProps) {
  return (
    <SettingsCard>
      <div className="grid gap-6 lg:grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)] lg:items-start">
        <UserCreatePhotoPanel
          nome={draft.nome}
          sobrenome={draft.sobrenome}
          photoPreviewUrl={photoPreviewUrl}
          onPhotoChange={onPhotoChange}
        />

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SettingsField label="Nome" htmlFor="userCreateNome">
              <Input
                id="userCreateNome"
                value={draft.nome}
                onChange={(event) => updateDraft({ nome: event.target.value })}
                hasError={Boolean(fieldErrors.nome)}
              />
              {fieldErrors.nome && (
                <p className="text-xs text-vscode-error">{fieldErrors.nome}</p>
              )}
            </SettingsField>

            <SettingsField label="Sobrenome" htmlFor="userCreateSobrenome">
              <Input
                id="userCreateSobrenome"
                value={draft.sobrenome}
                onChange={(event) => updateDraft({ sobrenome: event.target.value })}
                hasError={Boolean(fieldErrors.sobrenome)}
              />
              {fieldErrors.sobrenome && (
                <p className="text-xs text-vscode-error">{fieldErrors.sobrenome}</p>
              )}
            </SettingsField>
          </div>

          <SettingsField label="E-mail" htmlFor="userCreateEmail">
            <Input
              id="userCreateEmail"
              type="email"
              value={draft.email}
              onChange={(event) => updateDraft({ email: event.target.value })}
              hasError={Boolean(fieldErrors.email)}
            />
            {fieldErrors.email && (
              <p className="text-xs text-vscode-error">{fieldErrors.email}</p>
            )}
          </SettingsField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SettingsField label="Senha" htmlFor="userCreateSenha">
              <Input
                id="userCreateSenha"
                type="password"
                autoComplete="new-password"
                value={draft.senha}
                onChange={(event) => updateDraft({ senha: event.target.value })}
                hasError={Boolean(fieldErrors.senha)}
              />
              {fieldErrors.senha && (
                <p className="text-xs text-vscode-error">{fieldErrors.senha}</p>
              )}
            </SettingsField>

            <SettingsField label="Confirmar senha" htmlFor="userCreateConfirmarSenha">
              <Input
                id="userCreateConfirmarSenha"
                type="password"
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

          <div className="space-y-4 border-t border-vscode-border pt-4">
            <h3 className="text-sm font-semibold text-vscode-text">Opções especiais</h3>

            <SettingsField label="Copiar permissões de" htmlFor="userCreateCopyPermissions">
              <SettingsSelect
                id="userCreateCopyPermissions"
                value={draft.copyPermissionsFromId ?? ''}
                disabled={isLoadingUserOptions || isSaving}
                onChange={(event) => {
                  const value = event.target.value
                  updateDraft({
                    copyPermissionsFromId: value ? Number(value) : null,
                  })
                }}
              >
                <option value="">Nenhum</option>
                {userOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.nome}
                  </option>
                ))}
              </SettingsSelect>
            </SettingsField>

            <SettingsField label="Copiar dashboards de" htmlFor="userCreateCopyDashboards">
              <SettingsSelect
                id="userCreateCopyDashboards"
                value={draft.copyDashboardsFromId ?? ''}
                disabled={isLoadingUserOptions || isSaving}
                onChange={(event) => {
                  const value = event.target.value
                  updateDraft({
                    copyDashboardsFromId: value ? Number(value) : null,
                  })
                }}
              >
                <option value="">Nenhum</option>
                {userOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.nome}
                  </option>
                ))}
              </SettingsSelect>
            </SettingsField>
          </div>

          {fieldErrors.general && (
            <Alert variant="error">
              {fieldErrors.general}
              {createdUserId && (
                <>
                  {' '}
                  <Link
                    to="/usuarios/$userId/editar"
                    params={{ userId: String(createdUserId) }}
                    className="font-medium underline"
                  >
                    Editar usuário criado
                  </Link>
                </>
              )}
            </Alert>
          )}

          <div className="flex flex-wrap gap-2 border-t border-vscode-border pt-4">
            <Button type="button" loading={isSaving} onClick={onSaveToList}>
              Salvar
            </Button>
            <Button
              type="button"
              variant="secondary"
              loading={isSaving}
              onClick={onSaveAndEdit}
            >
              Salvar e Editar
            </Button>
          </div>
        </div>
      </div>
    </SettingsCard>
  )
}
