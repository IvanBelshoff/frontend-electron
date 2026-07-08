import SettingsField from '@/components/settings/SettingsField'
import SettingsSelect from '@/components/settings/SettingsSelect'
import Input from '@/components/ui/Input'
import { FilterOptionButton } from '@/features/dashboards/icons/DashboardIcons'
import type { ParametroRelatorio } from '@/features/reports/report-types'

type ReportParamFormProps = {
  parametros: ParametroRelatorio[]
  values: Record<string, unknown>
  onChange: (values: Record<string, unknown>) => void
  errors?: Record<string, string>
  disabled?: boolean
}

function getParamLabel(parametro: ParametroRelatorio): string {
  return parametro.label?.trim() || parametro.nome
}

function toInputDateValue(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) {
    return ''
  }

  return value.slice(0, 10)
}

export default function ReportParamForm({
  parametros,
  values,
  onChange,
  errors = {},
  disabled = false,
}: ReportParamFormProps) {
  if (parametros.length === 0) {
    return (
      <p className="text-sm text-vscode-text-muted">
        Este relatório não possui parâmetros configurados.
      </p>
    )
  }

  const updateValue = (nome: string, value: unknown) => {
    onChange({ ...values, [nome]: value })
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {parametros.map((parametro) => {
        const fieldId = `reportParam-${parametro.nome}`
        const label = getParamLabel(parametro)
        const requiredSuffix = parametro.obrigatorio ? ' *' : ''
        const fieldError = errors[parametro.nome]

        if (parametro.tipo === 'boolean') {
          const currentValue = values[parametro.nome] === true

          return (
            <SettingsField
              key={parametro.nome}
              label={`${label}${requiredSuffix}`}
              htmlFor={fieldId}
            >
              <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
                <FilterOptionButton
                  active={currentValue}
                  onClick={() => {
                    if (!disabled) {
                      updateValue(parametro.nome, true)
                    }
                  }}
                >
                  Sim
                </FilterOptionButton>
                <FilterOptionButton
                  active={!currentValue}
                  onClick={() => {
                    if (!disabled) {
                      updateValue(parametro.nome, false)
                    }
                  }}
                >
                  Não
                </FilterOptionButton>
              </div>
              {fieldError && <p className="text-xs text-vscode-error">{fieldError}</p>}
            </SettingsField>
          )
        }

        if (parametro.tipo === 'enum') {
          return (
            <SettingsField
              key={parametro.nome}
              label={`${label}${requiredSuffix}`}
              htmlFor={fieldId}
            >
              <SettingsSelect
                id={fieldId}
                value={String(values[parametro.nome] ?? '')}
                disabled={disabled}
                onChange={(event) => updateValue(parametro.nome, event.target.value)}
              >
                {!parametro.obrigatorio && <option value="">Selecione...</option>}
                {(parametro.valores ?? []).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </SettingsSelect>
              {fieldError && <p className="text-xs text-vscode-error">{fieldError}</p>}
            </SettingsField>
          )
        }

        const inputType =
          parametro.tipo === 'number' ? 'number' : parametro.tipo === 'date' ? 'date' : 'text'

        const inputValue =
          parametro.tipo === 'date'
            ? toInputDateValue(values[parametro.nome])
            : String(values[parametro.nome] ?? '')

        return (
          <SettingsField
            key={parametro.nome}
            label={`${label}${requiredSuffix}`}
            htmlFor={fieldId}
          >
            <Input
              id={fieldId}
              type={inputType}
              value={inputValue}
              disabled={disabled}
              hasError={Boolean(fieldError)}
              onChange={(event) => {
                const nextValue =
                  parametro.tipo === 'number' && event.target.value !== ''
                    ? Number(event.target.value)
                    : event.target.value

                updateValue(parametro.nome, nextValue)
              }}
            />
            {fieldError && <p className="text-xs text-vscode-error">{fieldError}</p>}
          </SettingsField>
        )
      })}
    </div>
  )
}
