import type { ReactNode } from 'react'

type DataGridDetailsGridProps = {
  children: ReactNode
}

export function DataGridDetailsField({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <p className="min-w-0 break-words">
      <strong className="font-semibold text-vscode-text-muted">{label}:</strong> {children}
    </p>
  )
}

export default function DataGridDetailsGrid({ children }: DataGridDetailsGridProps) {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-2 text-xs text-vscode-text-muted sm:grid-cols-2 sm:gap-x-4 sm:gap-y-2">
      {children}
    </div>
  )
}
