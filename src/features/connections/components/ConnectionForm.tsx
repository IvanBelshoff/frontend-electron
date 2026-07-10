import SettingsCard from '@/components/settings/SettingsCard'
import SettingsField from '@/components/settings/SettingsField'
import SettingsSelect from '@/components/settings/SettingsSelect'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type {
  ConnectionEditDraft,
  ConnectionFieldErrors,
  TipoConexao,
} from '@/features/connections/connection-types'

const DEFAULT_PORTS: Record<TipoConexao, number> = {
  postgres: 5432,
  mysql: 3306,
  mssql: 1433,
  oracle: 1521,
}

type ConnectionFormBaseProps = {
  draft: ConnectionEditDraft
  updateDraft: (patch: Partial<ConnectionEditDraft>) => void
  fieldErrors: ConnectionFieldErrors
  isSaving: boolean
}

type ConnectionFormEditProps = ConnectionFormBaseProps & {
  mode?: 'edit'
  isDirty: boolean
  saveSuccess: boolean
  onSave: () => void
  onCancel: () => void
  canUpdate?: boolean
}

type ConnectionFormCreateProps = ConnectionFormBaseProps & {
  mode: 'create'
  onSaveToList: () => void
  onSaveAndEdit: () => void
}

export type ConnectionFormProps = ConnectionFormEditProps | ConnectionFormCreateProps

export default function ConnectionForm(props: ConnectionFormProps) {
  const { draft, updateDraft, fieldErrors, isSaving } = props
  const isCreateMode = props.mode === 'create'

  function handleTipoChange(tipo: TipoConexao) {
    updateDraft({
      tipo,
      porta: DEFAULT_PORTS[tipo],
    })
  }

  return (
    <SettingsCard>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsField label="Nome" htmlFor="connectionName">
            <Input
              id="connectionName"
              value={draft.nome}
              onChange={(event) => updateDraft({ nome: event.target.value })}
              hasError={Boolean(fieldErrors.nome)}
              placeholder={isCreateMode ? 'Ex.: Produção - PostgreSQL' : undefined}
            />
            {fieldErrors.nome && <p className="text-xs text-vscode-error">{fieldErrors.nome}</p>}
          </SettingsField>

          <SettingsField label="Tipo" htmlFor="connectionType">
            <SettingsSelect
              id="connectionType"
              value={draft.tipo}
              onChange={(event) => handleTipoChange(event.target.value as TipoConexao)}
            >
              <option value="postgres">PostgreSQL</option>
              <option value="mysql">MySQL</option>
              <option value="mssql">SQL Server</option>
              <option value="oracle">Oracle</option>
            </SettingsSelect>
          </SettingsField>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <SettingsField label="Host" htmlFor="connectionHost">
            <Input
              id="connectionHost"
              value={draft.host}
              onChange={(event) => updateDraft({ host: event.target.value })}
              hasError={Boolean(fieldErrors.host)}
              placeholder="localhost"
            />
            {fieldErrors.host && <p className="text-xs text-vscode-error">{fieldErrors.host}</p>}
          </SettingsField>

          <SettingsField label="Porta" htmlFor="connectionPort">
            <Input
              id="connectionPort"
              type="number"
              min={1}
              value={draft.porta}
              onChange={(event) =>
                updateDraft({ porta: Number(event.target.value) || 0 })
              }
              hasError={Boolean(fieldErrors.porta)}
            />
            {fieldErrors.porta && <p className="text-xs text-vscode-error">{fieldErrors.porta}</p>}
          </SettingsField>

          <SettingsField label="Database" htmlFor="connectionDatabase">
            <Input
              id="connectionDatabase"
              value={draft.database}
              onChange={(event) => updateDraft({ database: event.target.value })}
              hasError={Boolean(fieldErrors.database)}
            />
            {fieldErrors.database && (
              <p className="text-xs text-vscode-error">{fieldErrors.database}</p>
            )}
          </SettingsField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsField label="Usuário" htmlFor="connectionUser">
            <Input
              id="connectionUser"
              value={draft.usuario}
              onChange={(event) => updateDraft({ usuario: event.target.value })}
              hasError={Boolean(fieldErrors.usuario)}
              autoComplete="off"
            />
            {fieldErrors.usuario && (
              <p className="text-xs text-vscode-error">{fieldErrors.usuario}</p>
            )}
          </SettingsField>

          <SettingsField
            label="Senha"
            htmlFor="connectionPassword"
            hint={isCreateMode ? undefined : 'Deixe em branco para manter a senha atual.'}
          >
            <Input
              id="connectionPassword"
              type="password"
              value={draft.senha}
              onChange={(event) => updateDraft({ senha: event.target.value })}
              hasError={Boolean(fieldErrors.senha)}
              autoComplete="new-password"
              placeholder={isCreateMode ? undefined : '••••••••'}
            />
            {fieldErrors.senha && <p className="text-xs text-vscode-error">{fieldErrors.senha}</p>}
          </SettingsField>
        </div>

        <SettingsField
          label="Opções (JSON)"
          htmlFor="connectionOptions"
          hint="Parâmetros adicionais em formato JSON. Deixe em branco se não houver."
        >
          <textarea
            id="connectionOptions"
            value={draft.opcoes}
            onChange={(event) => updateDraft({ opcoes: event.target.value })}
            rows={4}
            className="w-full rounded border border-vscode-border bg-vscode-input-bg px-3 py-2 font-mono text-sm text-vscode-text focus:outline-none focus:ring-2 focus:ring-vscode-accent/30"
            placeholder='{ "ssl": true }'
          />
        </SettingsField>

        {fieldErrors.general && <Alert variant="error">{fieldErrors.general}</Alert>}

        {props.mode !== 'create' && props.saveSuccess && !props.isDirty && (
          <Alert variant="success">Conexão salva com sucesso.</Alert>
        )}

        {props.mode === 'create' ? (
          <div className="flex flex-wrap gap-2 border-t border-vscode-border pt-4">
            <Button type="button" loading={isSaving} onClick={props.onSaveToList}>
              Salvar
            </Button>
            <Button
              type="button"
              variant="secondary"
              loading={isSaving}
              onClick={props.onSaveAndEdit}
            >
              Salvar e Editar
            </Button>
          </div>
        ) : (
          props.isDirty &&
          (props.mode === 'create' || (props.canUpdate ?? true)) && (
            <div className="flex flex-wrap gap-2 border-t border-vscode-border pt-4">
              <Button type="button" loading={isSaving} onClick={props.onSave}>
                Salvar
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={isSaving}
                onClick={props.onCancel}
              >
                Cancelar
              </Button>
            </div>
          )
        )}
      </div>
    </SettingsCard>
  )
}
