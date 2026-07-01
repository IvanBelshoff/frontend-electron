import clsx from 'clsx'
import { CheckIcon } from '@/components/settings/SettingsIcons'
import { ACCENT_COLOR_PRESETS } from '@/features/settings/accent-colors'

type AccentColorPickerProps = {
  value: string
  onChange: (color: string) => void
}

export default function AccentColorPicker({ value, onChange }: AccentColorPickerProps) {
  return (
    <div className="space-y-3">
      <div
        className="flex flex-wrap gap-2.5"
        role="listbox"
        aria-label="Cor primária de destaque"
      >
        {ACCENT_COLOR_PRESETS.map((preset) => {
          const isSelected = preset.value === value

          return (
            <button
              key={preset.id}
              type="button"
              role="option"
              aria-selected={isSelected}
              aria-label={preset.label}
              title={preset.label}
              onClick={() => onChange(preset.value)}
              className={clsx(
                'relative flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-105',
                isSelected && 'ring-2 ring-offset-2 ring-offset-vscode-sidebar',
              )}
              style={{
                backgroundColor: preset.value,
                ...(isSelected ? { ringColor: preset.value } : {}),
              }}
            >
              {isSelected && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-black/25 text-white">
                  <CheckIcon />
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-between gap-3 rounded-md border border-vscode-border bg-vscode-bg/40 px-3 py-2.5">
        <span className="text-xs text-vscode-text-muted">Pré-visualização</span>
        <button
          type="button"
          className="rounded px-3 py-1.5 text-xs font-medium text-white"
          style={{ backgroundColor: value }}
          tabIndex={-1}
          aria-hidden="true"
        >
          Exemplo
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-vscode-text-muted">Cor personalizada</span>
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-8 w-8 cursor-pointer rounded border border-vscode-border bg-transparent"
          aria-label="Cor personalizada"
          title="Escolher cor personalizada"
        />
      </div>
    </div>
  )
}
