import clsx from 'clsx'
import type { SelectHTMLAttributes } from 'react'

type SettingsSelectProps = SelectHTMLAttributes<HTMLSelectElement>

export default function SettingsSelect({ className, children, ...props }: SettingsSelectProps) {
  return (
    <select
      className={clsx(
        'h-9 w-full rounded border border-vscode-border bg-vscode-input-bg px-3 text-sm text-vscode-text focus:outline-none focus:ring-2 focus:ring-vscode-accent/30',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
