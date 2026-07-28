import clsx from 'clsx'
import { PlusIcon } from '@/features/dashboards/icons/DashboardIcons'

type AiNewConversationButtonProps = {
  disabled?: boolean
  loading?: boolean
  onClick: () => void
  className?: string
}

export default function AiNewConversationButton({
  disabled = false,
  loading = false,
  onClick,
  className,
}: AiNewConversationButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className={clsx(
        'group inline-flex h-8 items-center gap-2 rounded-lg border px-2.5 text-xs font-medium transition-[border-color,background-color,box-shadow]',
        'border-vscode-border/70 bg-vscode-bg/50 text-vscode-text',
        'hover:border-vscode-accent/45 hover:bg-vscode-accent/8 hover:shadow-[0_0_0_1px_rgb(var(--vscode-accent-rgb)/0.12)]',
        'focus:outline-none focus:ring-2 focus:ring-vscode-accent/25',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
    >
      <span
        className={clsx(
          'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors',
          'bg-vscode-accent/15 text-vscode-accent group-hover:bg-vscode-accent/25',
        )}
        aria-hidden
      >
        {loading ? (
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent" />
        ) : (
          <PlusIcon className="h-3 w-3" />
        )}
      </span>
      Nova conversa
    </button>
  )
}
