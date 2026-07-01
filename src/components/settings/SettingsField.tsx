import type { ReactNode } from 'react'

type SettingsFieldProps = {
  label: string
  htmlFor?: string
  hint?: string
  children?: ReactNode
}

export default function SettingsField({ label, htmlFor, hint, children }: SettingsFieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="block text-xs font-medium text-vscode-text-muted"
      >
        {label}
      </label>

      {children}

      {hint && <p className="text-xs leading-relaxed text-vscode-text-muted">{hint}</p>}
    </div>
  )
}
