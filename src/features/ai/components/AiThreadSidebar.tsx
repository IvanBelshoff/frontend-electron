import clsx from 'clsx'
import type { AiChatThread } from '@/features/ai/ai-chat-types'
import { formatThreadDate } from '@/features/ai/ai-chat-utils'

type AiThreadSidebarProps = {
  threads: AiChatThread[]
  activeThreadId?: string
  isLoading?: boolean
  isDeleting?: boolean
  onSelectThread: (thread: AiChatThread) => void
  onDeleteThread: (thread: AiChatThread) => void
}

export default function AiThreadSidebar({
  threads,
  activeThreadId,
  isLoading = false,
  isDeleting = false,
  onSelectThread,
  onDeleteThread,
}: AiThreadSidebarProps) {
  return (
    <aside className="flex min-h-0 w-64 shrink-0 flex-col border-r border-vscode-border bg-vscode-sidebar/80">
      <div className="border-b border-vscode-border px-3 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-vscode-text-muted">
          Conversas
        </h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <p className="px-2 py-4 text-sm text-vscode-text-muted">Carregando...</p>
        ) : threads.length === 0 ? (
          <p className="px-2 py-4 text-sm text-vscode-text-muted">Nenhuma conversa ainda.</p>
        ) : (
          <ul className="space-y-1">
            {threads.map((thread) => {
              const isActive = thread.id === activeThreadId

              return (
                <li key={thread.id}>
                  <div
                    className={clsx(
                      'group flex items-start gap-2 rounded-md border px-2 py-2 transition-colors',
                      isActive
                        ? 'border-vscode-accent/40 bg-vscode-accent/10'
                        : 'border-transparent hover:border-vscode-border hover:bg-vscode-bg/40',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectThread(thread)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span className="block truncate text-sm text-vscode-text">
                        {thread.titulo?.trim() || 'Nova conversa'}
                      </span>
                      <span className="mt-1 block text-[11px] text-vscode-text-muted">
                        {formatThreadDate(thread.updatedAt)}
                      </span>
                    </button>

                    <button
                      type="button"
                      title="Excluir conversa"
                      disabled={isDeleting}
                      onClick={() => onDeleteThread(thread)}
                      className="rounded px-1.5 py-0.5 text-xs text-vscode-text-muted opacity-0 transition-opacity hover:bg-vscode-bg hover:text-red-300 group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </aside>
  )
}
