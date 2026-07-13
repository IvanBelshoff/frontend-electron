import Input from '@/components/ui/Input'
import { FilterOptionButton } from '@/features/dashboards/icons/DashboardIcons'

const MS_PER_MINUTE = 60_000

const TIMEOUT_PRESETS_MINUTES = [2, 5, 10, 15, 30] as const

type ReportTimeoutFieldProps = {
  timeoutMs: number
  onChange: (timeoutMs: number) => void
  disabled?: boolean
}

function minutesFromMs(timeoutMs: number): number {
  return timeoutMs / MS_PER_MINUTE
}

function msFromMinutes(minutes: number): number {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return MS_PER_MINUTE
  }

  return Math.round(minutes * MS_PER_MINUTE)
}

export default function ReportTimeoutField({
  timeoutMs,
  onChange,
  disabled = false,
}: ReportTimeoutFieldProps) {
  const minutesValue = minutesFromMs(timeoutMs)

  return (
    <div className="space-y-3">
      <Input
        id="reportEditTimeoutMinutes"
        type="number"
        min={0.5}
        step={0.5}
        value={minutesValue}
        disabled={disabled}
        onChange={(event) => {
          const parsed = Number(event.target.value)
          onChange(msFromMinutes(parsed))
        }}
      />

      <div className="flex flex-wrap gap-2">
        {TIMEOUT_PRESETS_MINUTES.map((preset) => (
          <FilterOptionButton
            key={preset}
            active={Math.round(minutesValue) === preset}
            disabled={disabled}
            onClick={() => onChange(preset * MS_PER_MINUTE)}
          >
            {preset} min
          </FilterOptionButton>
        ))}
      </div>

      <p className="text-xs text-vscode-text-muted">
        Consultas pesadas no DWH costumam precisar de 5–10 minutos. Equivale a{' '}
        {timeoutMs.toLocaleString('pt-BR')} ms.
      </p>
    </div>
  )
}
