import clsx from 'clsx'
import type { AiChatMode } from '@/features/ai/ai-chat-types'

type AiChatModeBadgesProps = {
  mode: AiChatMode
  thinking: boolean
  isThinkingLocked: boolean
  thinkingSupported?: boolean
  disabled?: boolean
  onModeChange: (mode: AiChatMode) => void
  onToggleThinking: () => void
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function AnalyticsIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="M7 16v-4" />
      <path d="M12 16V8" />
      <path d="M17 16v-6" />
    </svg>
  )
}

function ThinkingIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3a4 4 0 0 0-4 4c-1.7.7-3 2.4-3 4.4 0 1.4.6 2.6 1.6 3.4-.4 1.7.6 3.4 2.3 3.9.7 1.4 2.2 2.3 3.8 2.3h.3" />
      <path d="M12 3a4 4 0 0 1 4 4c1.7.7 3 2.4 3 4.4 0 1.4-.6 2.6-1.6 3.4.4 1.7-.6 3.4-2.3 3.9-.7 1.4-2.2 2.3-3.8 2.3H11" />
      <path d="M12 3v18" />
    </svg>
  )
}

const BADGE_BASE =
  'inline-flex h-6 shrink-0 items-center gap-1.5 rounded-md px-2 text-[11px] font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-vscode-accent/40'

export default function AiChatModeBadges({
  mode,
  thinking,
  isThinkingLocked,
  thinkingSupported = true,
  disabled = false,
  onModeChange,
  onToggleThinking,
}: AiChatModeBadgesProps) {
  const thinkingDisabled = disabled || isThinkingLocked || !thinkingSupported

  const thinkingTitle = isThinkingLocked
    ? 'O modo Analítico sempre usa raciocínio estendido'
    : !thinkingSupported
      ? 'O modelo configurado não suporta raciocínio estendido'
      : thinking
        ? 'Desativar raciocínio estendido'
        : 'Ativar raciocínio estendido'

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-vscode-border/50 px-2 py-1.5">
      <div
        className="flex items-center gap-0.5 rounded-lg bg-vscode-activity-bar/50 p-0.5"
        role="group"
        aria-label="Modo do assistente"
      >
        <button
          type="button"
          disabled={disabled}
          aria-pressed={mode === 'normal'}
          title="Modo normal: respostas diretas sobre relatórios autorizados"
          onClick={() => onModeChange('normal')}
          className={clsx(
            BADGE_BASE,
            mode === 'normal'
              ? 'bg-vscode-sidebar text-vscode-text shadow-sm'
              : 'text-vscode-text-muted hover:text-vscode-text',
            disabled && 'pointer-events-none opacity-50',
          )}
        >
          <ChatIcon className="h-3.5 w-3.5" />
          Normal
        </button>

        <button
          type="button"
          disabled={disabled}
          aria-pressed={mode === 'analitico'}
          title="Modo analítico: análise de dados com estatísticas e gráficos"
          onClick={() => onModeChange('analitico')}
          className={clsx(
            BADGE_BASE,
            mode === 'analitico'
              ? 'bg-vscode-accent/20 text-vscode-accent shadow-sm'
              : 'text-vscode-text-muted hover:text-vscode-text',
            disabled && 'pointer-events-none opacity-50',
          )}
        >
          <AnalyticsIcon className="h-3.5 w-3.5" />
          Analítico
        </button>
      </div>

      <button
        type="button"
        disabled={thinkingDisabled}
        aria-pressed={thinking}
        title={thinkingTitle}
        onClick={onToggleThinking}
        className={clsx(
          BADGE_BASE,
          'border',
          thinking
            ? 'border-vscode-accent/40 bg-vscode-accent/10 text-vscode-accent'
            : 'border-vscode-border/70 text-vscode-text-muted hover:border-vscode-accent/30 hover:text-vscode-text',
          thinkingDisabled && 'cursor-not-allowed opacity-60',
          thinkingDisabled && !thinking && 'hover:border-vscode-border/70 hover:text-vscode-text-muted',
        )}
      >
        <ThinkingIcon className="h-3.5 w-3.5" />
        Pensamento
        {isThinkingLocked && (
          <span className="text-[9px] uppercase tracking-wide opacity-70">auto</span>
        )}
      </button>
    </div>
  )
}
