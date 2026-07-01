import clsx from 'clsx'
import type { ReactNode } from 'react'

type SettingsCardProps = {
  children: ReactNode
  className?: string
}

export default function SettingsCard({ children, className }: SettingsCardProps) {
  return (
    <article
      className={clsx(
        'flex flex-col rounded-lg border border-vscode-border bg-vscode-sidebar p-5',
        className,
      )}
    >
      {children}
    </article>
  )
}
