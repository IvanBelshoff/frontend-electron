import clsx from 'clsx'
import type { HTMLAttributes } from 'react'

type AlertVariant = 'error' | 'success' | 'info'

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: AlertVariant
}

const variantClasses: Record<AlertVariant, string> = {
  error: 'border-vscode-error/40 bg-vscode-error/10 text-vscode-error',
  success: 'border-vscode-success/40 bg-vscode-success/10 text-vscode-success',
  info: 'border-vscode-accent/40 bg-vscode-accent/10 text-vscode-text',
}

export default function Alert({
  variant = 'info',
  className,
  children,
  ...props
}: AlertProps) {
  return (
    <div
      role="alert"
      className={clsx(
        'rounded border px-3 py-2 text-sm',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
