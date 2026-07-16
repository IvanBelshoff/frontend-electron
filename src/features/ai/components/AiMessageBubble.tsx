import type { ChatStatus, UIMessage } from 'ai'
import AiMarkdown from '@/features/ai/components/AiMarkdown'
import { getMessageText, messageHasActiveToolCall } from '@/features/ai/ai-chat-utils'

type AiMessageBubbleProps = {
  message: UIMessage
  status: ChatStatus
  isLastAssistant?: boolean
}

export default function AiMessageBubble({
  message,
  status,
  isLastAssistant = false,
}: AiMessageBubbleProps) {
  const isUser = message.role === 'user'
  const text = getMessageText(message)
  const isStreamingAssistant =
    !isUser && isLastAssistant && (status === 'submitted' || status === 'streaming')
  const isToolRunning = isStreamingAssistant && messageHasActiveToolCall(message)
  const showSkeleton = isStreamingAssistant && !text && !isToolRunning

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

      {showSkeleton ? (
        <div className="space-y-2">
          <div className="h-3 w-4/5 animate-pulse rounded bg-vscode-border/60" />
          <div className="h-3 w-3/5 animate-pulse rounded bg-vscode-border/60" />
        </div>
      ) : isToolRunning ? (
        <p className="text-sm text-vscode-text-muted">Consultando relatório...</p>
      ) : isUser ? (
        <p className="whitespace-pre-wrap break-words text-sm text-vscode-text">{text}</p>
      ) : (
        <AiMarkdown content={text || (isStreamingAssistant ? '…' : '')} />
      )}
    </article>
  )
}
