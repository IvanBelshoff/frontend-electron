import clsx from 'clsx'
import IconButton from '@/components/ui/IconButton'
import type { AiChatThread } from '@/features/ai/ai-chat-types'
import { formatThreadDate } from '@/features/ai/ai-chat-utils'
import { DashboardMaterialIcon } from '@/features/dashboards/icons/DashboardIcons'

const SIDEBAR_WIDTH_EXPANDED = 256
const SIDEBAR_WIDTH_COLLAPSED = 40

type AiThreadSidebarProps = {
  threads: AiChatThread[]
  activeThreadId?: string
  isLoading?: boolean
  isDeleting?: boolean
  collapsed?: boolean
  onToggleCollapse?: () => void
  onSelectThread: (thread: AiChatThread) => void
  onDeleteThread: (thread: AiChatThread) => void
}

export default function AiThreadSidebar({
  threads,
  activeThreadId,
  isLoading = false,
  isDeleting = false,
  collapsed = false,
  onToggleCollapse,
  onSelectThread,
  onDeleteThread,
}: AiThreadSidebarProps) {
  return (
    <aside
      className={clsx(
        'flex min-h-0 shrink-0 flex-col overflow-hidden border-r border-vscode-border bg-vscode-sidebar/80 transition-[width] duration-200 ease-out',
        collapsed ? 'w-10' : 'w-64',
      )}
      style={{
        width: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
      }}
      aria-label="Histórico de conversas"
    >
      {collapsed ? (
        <div className="flex h-full flex-col items-center gap-2 py-2">
          <IconButton
            icon={<DashboardMaterialIcon name="chevron_right" className="text-[1.05rem]" />}
            label="Expandir histórico de conversas"
            onClick={onToggleCollapse}
            className="h-8 w-8 rounded-md text-vscode-text-muted hover:text-vscode-text"
          />
          <span
            className="text-[10px] font-semibold uppercase tracking-widest text-vscode-text-muted [writing-mode:vertical-rl]"
            aria-hidden="true"
          >
            Conversas
          </span>
          <DashboardMaterialIcon
            name="forum"
            className="mt-auto text-[1.15rem] text-vscode-text-muted/70"
          />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-2 border-b border-vscode-border px-2 py-2">
            <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-vscode-text-muted">
              Conversas
            </h2>
            {onToggleCollapse && (
              <IconButton
                icon={<DashboardMaterialIcon name="chevron_left" className="text-[1.05rem]" />}
                label="Minimizar histórico de conversas"
                onClick={onToggleCollapse}
                className="h-7 w-7 rounded-md text-vscode-text-muted hover:text-vscode-text"
              />
            )}
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
        </>
      )}
    </aside>
  )
}
