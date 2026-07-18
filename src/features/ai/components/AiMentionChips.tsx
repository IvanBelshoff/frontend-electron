import type { AiMention } from '@/features/ai/ai-mention-types'
import { formatMentionChip, mentionKey } from '@/features/ai/ai-mention-types'

type AiMentionChipsProps = {
  mentions: AiMention[]
  onRemove?: (mention: AiMention) => void
  readOnly?: boolean
}

export default function AiMentionChips({
  mentions,
  onRemove,
  readOnly = false,
}: AiMentionChipsProps) {
  if (mentions.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {mentions.map((mention) => (
        <span
          key={mentionKey(mention)}
          className="inline-flex max-w-full items-center gap-1 rounded border border-vscode-accent/40 bg-vscode-accent/15 px-2 py-0.5 text-xs text-vscode-text"
        >
          <span className="truncate">{formatMentionChip(mention)}</span>
          {!readOnly && onRemove && (
            <button
              type="button"
              className="shrink-0 rounded px-0.5 text-vscode-text-muted hover:bg-vscode-activity-bar hover:text-vscode-text"
              aria-label={`Remover ${formatMentionChip(mention)}`}
              onClick={() => onRemove(mention)}
            >
              ×
            </button>
          )}
        </span>
      ))}
    </div>
  )
}
