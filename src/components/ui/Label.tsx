import clsx from 'clsx'
import type { LabelHTMLAttributes } from 'react'

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>

export default function Label({ className, children, ...props }: LabelProps) {
  return (
    <label
      className={clsx('mb-1.5 block text-xs font-medium text-vscode-text-muted', className)}
      {...props}
    >
      {children}
    </label>
  )
}
