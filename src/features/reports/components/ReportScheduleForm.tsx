import SettingsCard from '@/components/settings/SettingsCard'
import SettingsField from '@/components/settings/SettingsField'
import Input from '@/components/ui/Input'
import { FilterOptionButton } from '@/features/dashboards/icons/DashboardIcons'
import ReportParamForm from '@/features/reports/components/ReportParamForm'
import type { ParametroRelatorio } from '@/features/reports/report-types'
import type { ReportScheduleDraft } from '@/features/reports/report-schedule-types'
import {
  describeScheduleSummary,
  formatDiasSemana,
  FREQUENCIA_OPTIONS,
  getFrequenciaLabel,
} from '@/features/reports/schedule-labels'
import { formatReportDate } from '@/features/reports/format-report-date'
import type { Agendamento } from '@/features/reports/report-schedule-types'

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) => index)
const MINUTE_OPTIONS = [0, 15, 30, 45]
const WEEKDAY_OPTIONS = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
]

type ReportScheduleFormProps = {
  draft: ReportScheduleDraft
  onChange: (patch: Partial<ReportScheduleDraft>) => void
  parametros: ParametroRelatorio[]
  parametrosSnapshot: Record<string, unknown>
  onParametrosChange: (values: Record<string, unknown>) => void
  agendamento?: Agendamento | null
  readOnly?: boolean
}

function toggleNumberInList(list: number[], value: number): number[] {
  if (list.includes(value)) {
    return list.filter((item) => item !== value)
  }

  return [...list, value].sort((a, b) => a - b)
}

export default function ReportScheduleForm({
  draft,
  onChange,
  parametros,
  parametrosSnapshot,
  onParametrosChange,
  agendamento = null,
  readOnly = false,
}: ReportScheduleFormProps) {
  const showInterval = draft.frequencia === 'minuto' || draft.frequencia === 'hora'
  const showTimeFields =
    draft.frequencia === 'dia' ||
    draft.frequencia === 'semana' ||
    draft.frequencia === 'mes'
  const showWeekdays = draft.frequencia === 'semana'

  return (
    <div className="space-y-6">
      {agendamento && (
        <div className="rounded-lg border border-vscode-border bg-vscode-sidebar/40 p-4 text-sm">
          <p className="font-medium text-vscode-text">{describeScheduleSummary(draft)}</p>
          <dl className="mt-3 grid grid-cols-1 gap-2 text-vscode-text-muted sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide">Próxima execução</dt>
              <dd className="text-vscode-text">{formatReportDate(agendamento.proximaExecucao)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide">Última execução</dt>
              <dd className="text-vscode-text">{formatReportDate(agendamento.ultimaExecucao)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-wide">Expressão cron</dt>
              <dd className="font-mono text-xs text-vscode-text">{agendamento.cronExpression}</dd>
            </div>
          </dl>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SettingsField label="Nome do agendamento" htmlFor="schedule-name">
          <Input
            id="schedule-name"
            value={draft.nome}
            onChange={(event) => onChange({ nome: event.target.value })}
            disabled={readOnly}
            placeholder="Ex.: Atualização diária do snapshot"
          />
        </SettingsField>

        <SettingsField label="Status">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Status do agendamento">
            <FilterOptionButton
              active={draft.ativo}
              onClick={() => {
                if (!readOnly) {
                  onChange({ ativo: true })
                }
              }}
            >
              Ativo
            </FilterOptionButton>
            <FilterOptionButton
              active={!draft.ativo}
              onClick={() => {
                if (!readOnly) {
                  onChange({ ativo: false })
                }
              }}
            >
              Inativo
            </FilterOptionButton>
          </div>
        </SettingsField>
      </div>

      <SettingsField label="Frequência">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Frequência">
          {FREQUENCIA_OPTIONS.map((frequencia) => (
            <FilterOptionButton
              key={frequencia}
              active={draft.frequencia === frequencia}
              onClick={() => {
                if (!readOnly) {
                  onChange({ frequencia })
                }
              }}
            >
              {getFrequenciaLabel(frequencia)}
            </FilterOptionButton>
          ))}
        </div>
      </SettingsField>

      {showInterval && (
        <SettingsField label="Intervalo" htmlFor="schedule-interval">
          <Input
            id="schedule-interval"
            type="number"
            min={1}
            value={draft.intervalo}
            onChange={(event) =>
              onChange({ intervalo: Math.max(1, Number(event.target.value) || 1) })
            }
            disabled={readOnly}
          />
          <p className="mt-1 text-xs text-vscode-text-muted">
            {draft.frequencia === 'minuto'
              ? 'Executar a cada N minutos'
              : 'Executar a cada N horas'}
          </p>
        </SettingsField>
      )}

      {showWeekdays && (
        <SettingsField label="Dias da semana">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Dias da semana">
            {WEEKDAY_OPTIONS.map((day) => (
              <FilterOptionButton
                key={day.value}
                active={draft.diasSemana.includes(day.value)}
                onClick={() => {
                  if (!readOnly) {
                    onChange({
                      diasSemana: toggleNumberInList(draft.diasSemana, day.value),
                    })
                  }
                }}
              >
                {day.label}
              </FilterOptionButton>
            ))}
          </div>
          {draft.diasSemana.length > 0 && (
            <p className="mt-1 text-xs text-vscode-text-muted">
              Selecionados: {formatDiasSemana(draft.diasSemana)}
            </p>
          )}
        </SettingsField>
      )}

      {showTimeFields && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SettingsField label="Horas (0–23)">
            <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto" role="group">
              {HOUR_OPTIONS.map((hour) => (
                <FilterOptionButton
                  key={hour}
                  active={draft.horas.includes(hour)}
                  onClick={() => {
                    if (!readOnly) {
                      onChange({ horas: toggleNumberInList(draft.horas, hour) })
                    }
                  }}
                >
                  {String(hour).padStart(2, '0')}h
                </FilterOptionButton>
              ))}
            </div>
          </SettingsField>

          <SettingsField label="Minutos">
            <div className="flex flex-wrap gap-2" role="group">
              {MINUTE_OPTIONS.map((minute) => (
                <FilterOptionButton
                  key={minute}
                  active={draft.minutos.includes(minute)}
                  onClick={() => {
                    if (!readOnly) {
                      onChange({ minutos: toggleNumberInList(draft.minutos, minute) })
                    }
                  }}
                >
                  :{String(minute).padStart(2, '0')}
                </FilterOptionButton>
              ))}
            </div>
          </SettingsField>
        </div>
      )}

      <SettingsCard className="border-vscode-border/80 bg-vscode-sidebar/30">
        <h4 className="mb-3 text-sm font-semibold text-vscode-text">Parâmetros do snapshot</h4>
        <ReportParamForm
          parametros={parametros}
          values={parametrosSnapshot}
          onChange={onParametrosChange}
          disabled={readOnly}
        />
      </SettingsCard>
    </div>
  )
}
