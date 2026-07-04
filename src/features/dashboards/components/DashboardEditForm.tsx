import { useState } from 'react'
import SettingsCard from '@/components/settings/SettingsCard'
import SettingsField from '@/components/settings/SettingsField'
import { PencilIcon } from '@/components/settings/SettingsIcons'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type {
  DashboardEditDraft,
  DashboardFieldErrors,
} from '@/features/dashboards/dashboard-types'
import DashboardIconPickerDialog from '@/features/dashboards/components/DashboardIconPickerDialog'
import {
  DashboardMaterialIcon,
  FilterOptionButton,
} from '@/features/dashboards/icons/DashboardIcons'

type DashboardEditFormBaseProps = {
  draft: DashboardEditDraft
  defaultIcon: string
  updateDraft: (patch: Partial<DashboardEditDraft>) => void
  fieldErrors: DashboardFieldErrors
  isSaving: boolean
}

type DashboardEditFormEditProps = DashboardEditFormBaseProps & {
  mode?: 'edit'
  isDirty: boolean
  saveSuccess: boolean
  onSave: () => void
  onCancel: () => void
}

type DashboardEditFormCreateProps = DashboardEditFormBaseProps & {
  mode: 'create'
  onSaveToList: () => void
  onSaveAndEdit: () => void
}

export type DashboardEditFormProps = DashboardEditFormEditProps | DashboardEditFormCreateProps

export default function DashboardEditForm(props: DashboardEditFormProps) {
  const { draft, defaultIcon, updateDraft, fieldErrors, isSaving } = props
  const [iconPickerOpen, setIconPickerOpen] = useState(false)
  const isCreateMode = props.mode === 'create'

  return (
    <>
      <SettingsCard>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <SettingsField label="Nome" htmlFor="dashboardEditName">
              <Input
                id="dashboardEditName"
                value={draft.nome}
                onChange={(event) => updateDraft({ nome: event.target.value })}
                hasError={Boolean(fieldErrors.nome)}
                placeholder={isCreateMode ? 'Ex.: Comercial - Receita mensal' : undefined}
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

          <SettingsField label="URL" htmlFor="dashboardEditUrl">
            <Input
              id="dashboardEditUrl"
              value={draft.url}
              onChange={(event) => updateDraft({ url: event.target.value })}
              hasError={Boolean(fieldErrors.url)}
              placeholder={isCreateMode ? 'https://seu-dominio.com/dashboard' : undefined}
            />
            {fieldErrors.url && (
              <p className="text-xs text-vscode-error">{fieldErrors.url}</p>
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
              <SettingsField label="Data expiração inicial" htmlFor="dashboardEditStartDate">
                <Input
                  id="dashboardEditStartDate"
                  type="date"
                  value={draft.dataExpiracaoInicial ?? ''}
                  onChange={(event) =>
                    updateDraft({
                      dataExpiracaoInicial: event.target.value || null,
                    })
                  }
                />
              </SettingsField>

              <SettingsField label="Data expiração final" htmlFor="dashboardEditEndDate">
                <Input
                  id="dashboardEditEndDate"
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

          {fieldErrors.general && <Alert variant="error">{fieldErrors.general}</Alert>}

          {props.mode !== 'create' && props.saveSuccess && !props.isDirty && (
            <Alert variant="success">Dashboard salvo com sucesso.</Alert>
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
