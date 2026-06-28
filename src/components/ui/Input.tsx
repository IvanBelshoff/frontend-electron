import clsx from 'clsx'
import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean
}

export default function Input({ className, hasError = false, ...props }: InputProps) {
  return (
    <input
      className={clsx(
        'h-9 w-full rounded border bg-vscode-input-bg px-3 text-sm text-vscode-text placeholder:text-vscode-text-muted focus:outline-none focus:ring-2',
        hasError
          ? 'border-vscode-error focus:ring-vscode-error/30'
          : 'border-vscode-border focus:ring-vscode-accent/30',
        className,
      )}
      {...props}
    />
  )
}
