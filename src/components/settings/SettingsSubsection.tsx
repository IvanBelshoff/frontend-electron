import type { ReactNode } from 'react'

type SettingsSubsectionProps = {
  title: string
  children: ReactNode
  className?: string
}

export default function SettingsSubsection({ title, children, className }: SettingsSubsectionProps) {
  return (
    <section className={className}>
      <h3 className="mb-4 border-t border-vscode-border pt-5 text-sm font-semibold text-vscode-text first:border-t-0 first:pt-0">
        {title}
      </h3>
      <div className="space-y-5">{children}</div>
    </section>
  )
}
