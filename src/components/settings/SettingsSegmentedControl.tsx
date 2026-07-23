import clsx from 'clsx'
import type { ReactNode } from 'react'

export type SegmentedOption<T extends string> = {
  value: T
  label: string
  icon?: ReactNode
}

type SettingsSegmentedControlProps<T extends string> = {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  ariaLabel: string
  disabled?: boolean
}

export default function SettingsSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  disabled = false,
}: SettingsSegmentedControlProps<T>) {
  return (
    <div
      className={clsx('grid grid-cols-3 gap-2', disabled && 'pointer-events-none opacity-50')}
      role="group"
      aria-label={ariaLabel}
      aria-disabled={disabled}
    >
      {options.map((option) => {
        const isActive = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={clsx(
              'flex flex-col items-center gap-1.5 rounded-md border px-2 py-2.5 text-xs transition-colors',
              isActive
                ? 'border-vscode-accent bg-vscode-accent/10 text-vscode-text'
                : 'border-vscode-border bg-vscode-input-bg/50 text-vscode-text-muted hover:border-vscode-accent/40 hover:text-vscode-text',
            )}
          >
            {option.icon && (
              <span className={clsx(isActive ? 'text-vscode-accent' : 'text-vscode-text-muted')}>
                {option.icon}
              </span>
            )}
            <span>{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
