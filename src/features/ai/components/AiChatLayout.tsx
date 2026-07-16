import type { ReactNode } from 'react'

type AiChatLayoutProps = {
  sidebar: ReactNode
  header: ReactNode
  children: ReactNode
  composer: ReactNode
}

export default function AiChatLayout({ sidebar, header, children, composer }: AiChatLayoutProps) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {header}

      <div className="flex min-h-0 flex-1 overflow-hidden rounded-lg border border-vscode-border bg-vscode-sidebar">
        {sidebar}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
          <div className="shrink-0">{composer}</div>
        </div>
      </div>
    </div>
  )
}
