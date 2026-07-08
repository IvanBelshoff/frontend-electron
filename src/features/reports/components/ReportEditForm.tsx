import clsx from 'clsx'
import { useEffect, useState } from 'react'
import SettingsCard from '@/components/settings/SettingsCard'
import SettingsField from '@/components/settings/SettingsField'
import { PencilIcon } from '@/components/settings/SettingsIcons'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import DashboardIconPickerDialog from '@/features/dashboards/components/DashboardIconPickerDialog'
import {
  DashboardMaterialIcon,
  FilterOptionButton,
} from '@/features/dashboards/icons/DashboardIcons'
import ConnectionSelect from '@/features/reports/components/ConnectionSelect'
import type {
  ParametroRelatorio,
  ReportEditDraft,
  ReportFieldErrors,
} from '@/features/reports/report-types'

type ReportEditFormBaseProps = {
  draft: ReportEditDraft
  defaultIcon: string
  updateDraft: (patch: Partial<ReportEditDraft>) => void
  fieldErrors: ReportFieldErrors
  isSaving: boolean
}

type ReportEditFormEditProps = ReportEditFormBaseProps & {
  mode?: 'edit'
  isDirty: boolean
  saveSuccess: boolean
  onSave: () => void
  onCancel: () => void
}

type ReportEditFormCreateProps = ReportEditFormBaseProps & {
  mode: 'create'
  onSaveToList: () => void
  onSaveAndEdit: () => void
}

export type ReportEditFormProps = ReportEditFormEditProps | ReportEditFormCreateProps

function formatParametrosJson(parametros: ParametroRelatorio[]): string {
  if (parametros.length === 0) {
    return '[]'
  }

  return JSON.stringify(parametros, null, 2)
}

function parseParametrosJson(value: string): { parametros: ParametroRelatorio[]; error?: string } {
  const trimmed = value.trim()

  if (!trimmed) {
    return { parametros: [] }
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown

    if (!Array.isArray(parsed)) {
      return { parametros: [], error: 'Parâmetros devem ser um array JSON.' }
    }

    return { parametros: parsed as ParametroRelatorio[] }
  } catch {
    return { parametros: [], error: 'JSON de parâmetros inválido.' }
  }
}

export default function ReportEditForm(props: ReportEditFormProps) {
  const { draft, defaultIcon, updateDraft, fieldErrors, isSaving } = props
  const [iconPickerOpen, setIconPickerOpen] = useState(false)
  const [parametrosJson, setParametrosJson] = useState(() => formatParametrosJson(draft.parametros))
  const [parametrosJsonError, setParametrosJsonError] = useState<string | null>(null)
  const isCreateMode = props.mode === 'create'

  useEffect(() => {
    setParametrosJson(formatParametrosJson(draft.parametros))
    setParametrosJsonError(null)
  }, [draft.parametros])

  const commitParametrosJson = () => {
    const { parametros, error } = parseParametrosJson(parametrosJson)

    if (error) {
      setParametrosJsonError(error)
      return
    }

    setParametrosJsonError(null)
    updateDraft({ parametros })
  }

  return (
    <>
      <SettingsCard>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <SettingsField label="Nome" htmlFor="reportEditName">
              <Input
                id="reportEditName"
                value={draft.nome}
                onChange={(event) => updateDraft({ nome: event.target.value })}
                hasError={Boolean(fieldErrors.nome)}
                placeholder={isCreateMode ? 'Ex.: Vendas - Resumo mensal' : undefined}
              />
              {fieldErrors.nome && (
                <p className="text-xs text-vscode-error">{fieldErrors.nome}</p>
              )}
            </SettingsField>

            <SettingsField label="Ícone">
              <button
                type="button"
                onClick={() => setIconPickerOpen(true)}
                className="flex w-full items-center gap-3 rounded border border-vscode-border bg-vscode-bg/40 px-3 py-2 text-left transition-colors hover:border-vscode-accent/40"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-vscode-accent/15 text-vscode-accent">
                  <DashboardMaterialIcon name={draft.icone} className="text-[1.35rem]" filled />
                </span>
                <span className="min-w-0 flex-1 truncate font-mono text-sm text-vscode-text">
                  {draft.icone}
                </span>
                <PencilIcon className="h-4 w-4 shrink-0 text-vscode-text-muted" />
              </button>
            </SettingsField>
          </div>

          <ConnectionSelect
            value={draft.idConexao}
            onChange={(idConexao) => updateDraft({ idConexao })}
            hasError={Boolean(fieldErrors.idConexao)}
          />
          {fieldErrors.idConexao && (
            <p className="text-xs text-vscode-error">{fieldErrors.idConexao}</p>
          )}

          <SettingsField label="Query" htmlFor="reportEditQuery">
            <textarea
              id="reportEditQuery"
              value={draft.query}
              onChange={(event) => updateDraft({ query: event.target.value })}
              rows={6}
              placeholder={isCreateMode ? 'SELECT ...' : undefined}
              className={clsx(
                'w-full rounded border bg-vscode-input-bg px-3 py-2 font-mono text-sm text-vscode-text placeholder:text-vscode-text-muted focus:outline-none focus:ring-2',
                fieldErrors.query
                  ? 'border-vscode-error focus:ring-vscode-error/30'
                  : 'border-vscode-border focus:ring-vscode-accent/30',
              )}
            />
            {fieldErrors.query && (
              <p className="text-xs text-vscode-error">{fieldErrors.query}</p>
            )}
          </SettingsField>

          <SettingsField
            label="Parâmetros"
            htmlFor="reportEditParametros"
            hint={'Array JSON de parâmetros do relatório. Ex.: [{ "nome": "data_inicio", "tipo": "date", "obrigatorio": true }]'}
          >
            <textarea
              id="reportEditParametros"
              value={parametrosJson}
              onChange={(event) => {
                setParametrosJson(event.target.value)
                setParametrosJsonError(null)
              }}
              onBlur={commitParametrosJson}
              rows={5}
              className={clsx(
                'w-full rounded border bg-vscode-input-bg px-3 py-2 font-mono text-sm text-vscode-text placeholder:text-vscode-text-muted focus:outline-none focus:ring-2',
                parametrosJsonError
                  ? 'border-vscode-error focus:ring-vscode-error/30'
                  : 'border-vscode-border focus:ring-vscode-accent/30',
              )}
            />
            {parametrosJsonError && (
              <p className="text-xs text-vscode-error">{parametrosJsonError}</p>
            )}
          </SettingsField>

          <div className="grid grid-cols-3 gap-4">
            <SettingsField label="Privacidade">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Privacidade">
                <FilterOptionButton
                  active={draft.privacidade === 'privado'}
                  onClick={() => updateDraft({ privacidade: 'privado' })}
                >
                  Privado
                </FilterOptionButton>
                <FilterOptionButton
                  active={draft.privacidade === 'publico'}
                  onClick={() => updateDraft({ privacidade: 'publico' })}
                >
                  Público
                </FilterOptionButton>
              </div>
            </SettingsField>

            <SettingsField label="Visível">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Visibilidade">
                <FilterOptionButton
                  active={draft.visivel}
                  onClick={() => updateDraft({ visivel: true })}
                >
                  Sim
                </FilterOptionButton>
                <FilterOptionButton
                  active={!draft.visivel}
                  onClick={() => updateDraft({ visivel: false })}
                >
                  Não
                </FilterOptionButton>
              </div>
            </SettingsField>

            <SettingsField label="Temporário">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Temporário">
                <FilterOptionButton
                  active={draft.temporario}
                  onClick={() => updateDraft({ temporario: true })}
                >
                  Sim
                </FilterOptionButton>
                <FilterOptionButton
                  active={!draft.temporario}
                  onClick={() => updateDraft({ temporario: false })}
                >
                  Não
                </FilterOptionButton>
              </div>
            </SettingsField>
          </div>

          {draft.temporario && (
            <div className="grid gap-4 sm:grid-cols-2">
              <SettingsField label="Data expiração inicial" htmlFor="reportEditStartDate">
                <Input
                  id="reportEditStartDate"
                  type="date"
                  value={draft.dataExpiracaoInicial ?? ''}
                  onChange={(event) =>
                    updateDraft({
                      dataExpiracaoInicial: event.target.value || null,
                    })
                  }
                />
              </SettingsField>

              <SettingsField label="Data expiração final" htmlFor="reportEditEndDate">
                <Input
                  id="reportEditEndDate"
                  type="date"
                  value={draft.dataExpiracaoFinal ?? ''}
                  onChange={(event) =>
                    updateDraft({
                      dataExpiracaoFinal: event.target.value || null,
                    })
                  }
                />
              </SettingsField>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <SettingsField label="Estado">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Estado">
                <FilterOptionButton
                  active={draft.estado === 'online'}
                  onClick={() => updateDraft({ estado: 'online' })}
                >
                  Online
                </FilterOptionButton>
                <FilterOptionButton
                  active={draft.estado === 'offline'}
                  onClick={() => updateDraft({ estado: 'offline' })}
                >
                  Offline
                </FilterOptionButton>
              </div>
            </SettingsField>

            <SettingsField label="Limite de linhas" htmlFor="reportEditLimiteLinhas">
              <Input
                id="reportEditLimiteLinhas"
                type="number"
                min={1}
                value={draft.limiteLinhas}
                onChange={(event) =>
                  updateDraft({ limiteLinhas: Number(event.target.value) || 0 })
                }
              />
            </SettingsField>

            <SettingsField label="Timeout (ms)" htmlFor="reportEditTimeoutMs">
              <Input
                id="reportEditTimeoutMs"
                type="number"
                min={1}
                value={draft.timeoutMs}
                onChange={(event) =>
                  updateDraft({ timeoutMs: Number(event.target.value) || 0 })
                }
              />
            </SettingsField>
          </div>

          {fieldErrors.general && <Alert variant="error">{fieldErrors.general}</Alert>}

          {props.mode !== 'create' && props.saveSuccess && !props.isDirty && (
            <Alert variant="success">Relatório salvo com sucesso.</Alert>
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
            props.isDirty && (
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

      <DashboardIconPickerDialog
        isOpen={iconPickerOpen}
        onClose={() => setIconPickerOpen(false)}
        selectedIcon={draft.icone}
        defaultIcon={defaultIcon}
        onSelect={(icon) => updateDraft({ icone: icon })}
      />
    </>
  )
}
