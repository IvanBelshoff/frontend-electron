import clsx from 'clsx'

type AiKnowledgeToggleButtonProps = {
  active?: boolean
  disabled?: boolean
  onClick: () => void
}

export default function AiKnowledgeToggleButton({
  active = false,
  disabled = false,
  onClick,
}: AiKnowledgeToggleButtonProps) {
  return (
    <button
      type="button"
      title="Permitir conhecimento da IA"
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
      className={clsx(
        'shrink-0 rounded border px-2 py-1 text-[10px] font-medium uppercase tracking-wide transition-colors',
        active
          ? 'border-vscode-accent/50 bg-vscode-accent/15 text-vscode-accent'
          : 'border-vscode-border text-vscode-text-muted hover:border-vscode-accent/40 hover:text-vscode-text',
        disabled && 'cursor-not-allowed opacity-60',
      )}
    >
      IA
    </button>
  )
}
