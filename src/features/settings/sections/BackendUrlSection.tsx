import SettingsCard from '@/components/settings/SettingsCard'
import SettingsCardHeader from '@/components/settings/SettingsCardHeader'
import SettingsField from '@/components/settings/SettingsField'
import { LinkIcon, LockOpenIcon, PencilIcon, RefreshIcon } from '@/components/settings/SettingsIcons'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import IconButton from '@/components/ui/IconButton'
import Input from '@/components/ui/Input'
import { useBackendUrlSettings } from '@/features/settings/hooks/use-backend-url-settings'

export default function BackendUrlSection() {
  const {
    baseUrl,
    draftUrl,
    setDraftUrl,
    isEditing,
    validationState,
    canSave,
    isValidating,
    startEdit,
    cancelEdit,
    validate,
    save,
    restoreDefault,
  } = useBackendUrlSettings()

  return (
    <SettingsCard>
      <SettingsCardHeader
        icon={<LinkIcon />}
        title="URL do backend"
        description="Endpoint padrão para comunicação da aplicação."
        actions={
          <>
            {isEditing && (
              <IconButton
                icon={<RefreshIcon />}
                label="Restaurar URL padrão"
                title="Restaurar padrão"
                onClick={restoreDefault}
              />
            )}
            <IconButton
              icon={isEditing ? <LockOpenIcon /> : <PencilIcon />}
              label={isEditing ? 'Cancelar edição da URL' : 'Editar URL do backend'}
              title={isEditing ? 'Fechar edição' : 'Editar URL'}
              onClick={isEditing ? cancelEdit : startEdit}
            />
          </>
        }
      />

      {isEditing ? (
        <div className="space-y-4">
          <SettingsField label="URL base da API" htmlFor="settingsBackendUrl">
            <Input
              id="settingsBackendUrl"
              value={draftUrl}
              onChange={(event) => setDraftUrl(event.target.value)}
              placeholder="http://localhost:3000"
            />
          </SettingsField>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={isValidating}
              onClick={validate}
            >
              {isValidating ? 'Validando...' : 'Validar'}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isValidating || !canSave}
              onClick={save}
            >
              Salvar
            </Button>
          </div>

          {validationState.status === 'success' && (
            <Alert variant="success">{validationState.message}</Alert>
          )}

          {validationState.status === 'error' && (
            <Alert variant="error">{validationState.message}</Alert>
          )}
        </div>
      ) : (
        <SettingsField
          label="URL base da API"
          hint="Use o ícone de edição para alterar. Após validar e salvar, o campo volta ao modo protegido."
        >
          <p className="truncate rounded border border-vscode-border bg-vscode-bg/40 px-3 py-2 text-sm text-vscode-text">
            {baseUrl}
          </p>
        </SettingsField>
      )}
    </SettingsCard>
  )
}
