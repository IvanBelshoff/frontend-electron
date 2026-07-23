import clsx from 'clsx'
import SettingsField from '@/components/settings/SettingsField'

type ToggleFieldProps = {
  label: string
  hint?: string
  value: boolean
  onChange: (value: boolean) => void
}

export default function ToggleField({ label, hint, value, onChange }: ToggleFieldProps) {
  return (
    <SettingsField label={label} hint={hint}>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={clsx(
            'rounded-md border px-4 py-2 text-xs font-medium transition-colors',
            value
              ? 'border-vscode-accent bg-vscode-accent/10 text-vscode-text'
              : 'border-vscode-border bg-vscode-input-bg/50 text-vscode-text-muted hover:border-vscode-accent/40',
          )}
        >
          Sim
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={clsx(
            'rounded-md border px-4 py-2 text-xs font-medium transition-colors',
            !value
              ? 'border-vscode-accent bg-vscode-accent/10 text-vscode-text'
              : 'border-vscode-border bg-vscode-input-bg/50 text-vscode-text-muted hover:border-vscode-accent/40',
          )}
        >
          Não
        </button>
      </div>
    </SettingsField>
  )
}
