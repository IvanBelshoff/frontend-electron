import clsx from 'clsx'
import { useEffect, useId, useRef, useState } from 'react'
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

function ChevronDownIcon({ className }: { className?: string }) {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

const MODE_OPTIONS: Array<{
  id: AiChatMode
  label: string
  description: string
  Icon: typeof ChatIcon
}> = [
  {
    id: 'normal',
    label: 'Normal',
    description: 'Respostas diretas sobre relatórios autorizados',
    Icon: ChatIcon,
  },
  {
    id: 'analitico',
    label: 'Analítico',
    description: 'Análise de dados com estatísticas e gráficos',
    Icon: AnalyticsIcon,
  },
]

export default function AiChatModeBadges({
  mode,
  thinking,
  isThinkingLocked,
  thinkingSupported = true,
  disabled = false,
  onModeChange,
  onToggleThinking,
}: AiChatModeBadgesProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  const currentMode = MODE_OPTIONS.find((option) => option.id === mode) ?? MODE_OPTIONS[0]
  const CurrentIcon = currentMode.Icon
  const thinkingDisabled = disabled || isThinkingLocked || !thinkingSupported

  const thinkingTitle = isThinkingLocked
    ? 'O modo Analítico sempre usa raciocínio estendido'
    : !thinkingSupported
      ? 'O modelo configurado não suporta raciocínio estendido'
      : thinking
        ? 'Desativar raciocínio estendido'
        : 'Ativar raciocínio estendido'

  useEffect(() => {
    if (!open) {
      return
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  function selectMode(nextMode: AiChatMode) {
    onModeChange(nextMode)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        title={`Modo: ${currentMode.label}`}
        onClick={() => setOpen((current) => !current)}
        className={clsx(
          'inline-flex h-7 max-w-[9.5rem] items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-medium transition-colors',
          'border-vscode-border/60 bg-vscode-activity-bar/80 text-vscode-text-muted',
          'hover:border-vscode-border hover:bg-vscode-sidebar hover:text-vscode-text',
          'focus:outline-none focus:ring-1 focus:ring-vscode-accent/40',
          open && 'border-vscode-accent/40 bg-vscode-sidebar text-vscode-text',
          disabled && 'pointer-events-none opacity-50',
        )}
      >
        <CurrentIcon className="h-3.5 w-3.5 shrink-0 opacity-80" />
        <span className="truncate">{currentMode.label}</span>
        <ChevronDownIcon
          className={clsx(
            'h-3 w-3 shrink-0 opacity-60 transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div
          id={menuId}
          role="listbox"
          aria-label="Modo do assistente"
          className="absolute bottom-full left-0 z-30 mb-1.5 min-w-[15rem] overflow-hidden rounded-lg border border-vscode-border bg-vscode-sidebar py-1 shadow-xl"
        >
          {MODE_OPTIONS.map((option) => {
            const isActive = option.id === mode
            const OptionIcon = option.Icon

            return (
              <button
                key={option.id}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => selectMode(option.id)}
                className={clsx(
                  'flex w-full items-start gap-2.5 px-2.5 py-2 text-left transition-colors',
                  isActive
                    ? 'bg-vscode-accent/10 text-vscode-text'
                    : 'text-vscode-text hover:bg-vscode-activity-bar',
                )}
              >
                <OptionIcon
                  className={clsx(
                    'mt-0.5 h-4 w-4 shrink-0',
                    isActive ? 'text-vscode-accent' : 'text-vscode-text-muted',
                  )}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-medium">{option.label}</span>
                  <span className="mt-0.5 block text-[10px] leading-snug text-vscode-text-muted">
                    {option.description}
                  </span>
                </span>
                {isActive && (
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-vscode-accent" />
                )}
              </button>
            )
          })}

          <div className="my-1 border-t border-vscode-border/70" />

          <button
            type="button"
            disabled={thinkingDisabled}
            title={thinkingTitle}
            onClick={onToggleThinking}
            className={clsx(
              'flex w-full items-center gap-2.5 px-2.5 py-2 text-left transition-colors',
              thinkingDisabled
                ? 'cursor-not-allowed opacity-60'
                : 'hover:bg-vscode-activity-bar',
            )}
          >
            <ThinkingIcon
              className={clsx(
                'h-4 w-4 shrink-0',
                thinking ? 'text-vscode-accent' : 'text-vscode-text-muted',
              )}
            />
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-medium text-vscode-text">
                Pensamento
                {isThinkingLocked && (
                  <span className="ml-1.5 text-[9px] font-semibold uppercase tracking-wide text-vscode-text-muted">
                    auto
                  </span>
                )}
              </span>
              <span className="mt-0.5 block text-[10px] leading-snug text-vscode-text-muted">
                {isThinkingLocked
                  ? 'Sempre ativo no modo Analítico'
                  : 'Raciocínio estendido antes da resposta'}
              </span>
            </span>
            <span
              className={clsx(
                'relative inline-flex h-4 w-7 shrink-0 rounded-full border transition-colors',
                thinking
                  ? 'border-vscode-accent/50 bg-vscode-accent/30'
                  : 'border-vscode-border bg-vscode-activity-bar',
                thinkingDisabled && 'opacity-70',
              )}
              aria-hidden="true"
            >
              <span
                className={clsx(
                  'absolute top-0.5 h-2.5 w-2.5 rounded-full bg-vscode-text transition-transform',
                  thinking ? 'left-[calc(100%-0.75rem)]' : 'left-0.5',
                )}
              />
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
