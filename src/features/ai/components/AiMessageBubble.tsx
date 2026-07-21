import type { ChatStatus, UIMessage } from 'ai'
import AiMarkdown from '@/features/ai/components/AiMarkdown'
import AiMentionChips from '@/features/ai/components/AiMentionChips'
import AiExploreCardView from '@/features/ai/components/AiExploreCard'
import type { AiMention } from '@/features/ai/ai-mention-types'
import { getExploreCardFromMessage } from '@/features/ai/ai-explore-card-utils'
import { getMessageText, getActiveToolStatusLabel, messageHasActiveToolCall } from '@/features/ai/ai-chat-utils'

type AiMessageBubbleProps = {
  message: UIMessage
  status: ChatStatus
  isLastAssistant?: boolean
  threadId?: string
  onChipClick?: (value: string) => void
  onExploreRefresh?: () => void
}

function getMessageMentions(message: UIMessage): AiMention[] {
  const metadata = message.metadata as { mentions?: AiMention[] } | undefined
  if (!metadata?.mentions || !Array.isArray(metadata.mentions)) {
    return []
  }
  return metadata.mentions
}

export default function AiMessageBubble({
  message,
  status,
  isLastAssistant = false,
  threadId,
  onChipClick,
  onExploreRefresh,
}: AiMessageBubbleProps) {
  const isUser = message.role === 'user'
  const text = getMessageText(message)
  const mentions = isUser ? getMessageMentions(message) : []
  const exploreCard = !isUser ? getExploreCardFromMessage(message) : null
  const isStreamingAssistant =
    !isUser && isLastAssistant && (status === 'submitted' || status === 'streaming')
  const isToolRunning = isStreamingAssistant && messageHasActiveToolCall(message)
  const showSkeleton = isStreamingAssistant && !text && !isToolRunning && !exploreCard

  return (
    <article
      className={
        isUser
          ? 'ml-auto max-w-[85%] rounded-lg bg-vscode-accent/20 px-4 py-3'
          : 'mr-auto max-w-[85%] rounded-lg border border-vscode-border bg-vscode-input-bg/40 px-4 py-3'
      }
    >
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-vscode-text-muted">
        {isUser ? 'Você' : 'Assistente'}
      </p>

      {mentions.length > 0 && (
        <div className="mb-2">
          <AiMentionChips mentions={mentions} readOnly />
        </div>
      )}

      {showSkeleton ? (
        <div className="space-y-2">
          <div className="h-3 w-4/5 animate-pulse rounded bg-vscode-border/60" />
          <div className="h-3 w-3/5 animate-pulse rounded bg-vscode-border/60" />
        </div>
      ) : isToolRunning ? (
        <p className="text-sm text-vscode-text-muted">{getActiveToolStatusLabel(message)}</p>
      ) : isUser ? (
        <p className="whitespace-pre-wrap break-words text-sm text-vscode-text">{text}</p>
      ) : (
        <>
          {(text || isStreamingAssistant) && (
            <AiMarkdown content={text || (isStreamingAssistant ? '…' : '')} />
          )}
          {exploreCard && (
            <AiExploreCardView
              card={exploreCard}
              threadId={threadId}
              disabled={status === 'submitted' || status === 'streaming'}
              onChipClick={onChipClick}
              onJobStarted={onExploreRefresh}
              onJobFinished={onExploreRefresh}
            />
          )}
        </>
      )}
    </article>
  )
}
