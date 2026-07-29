import type { ChatStatus, UIMessage } from 'ai'
import AiChartRenderer from '@/features/ai/components/AiChartRenderer'
import AiMarkdown from '@/features/ai/components/AiMarkdown'
import AiMentionChips from '@/features/ai/components/AiMentionChips'
import AiReasoningBlock from '@/features/ai/components/AiReasoningBlock'
import type { AiMention } from '@/features/ai/ai-mention-types'
import {
  getMessageCharts,
  getMessageReasoning,
  getMessageText,
  getRunningToolLabel,
  isMessageAwaitingAnalysis,
  messageHasActiveToolCall,
} from '@/features/ai/ai-chat-utils'

type AiMessageBubbleProps = {
  message: UIMessage
  status: ChatStatus
  isLastAssistant?: boolean
  pendingAnalysisJobIds?: string[]
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
  pendingAnalysisJobIds = [],
}: AiMessageBubbleProps) {
  const isUser = message.role === 'user'
  const isAwaitingAnalysis = isMessageAwaitingAnalysis(message, pendingAnalysisJobIds)
  const text = getMessageText(message)
  const mentions = isUser ? getMessageMentions(message) : []
  const charts = isUser ? [] : getMessageCharts(message)
  const reasoning = isUser ? null : getMessageReasoning(message)
  const isStreamingAssistant =
    !isUser && isLastAssistant && (status === 'submitted' || status === 'streaming')
  const isToolRunning = isStreamingAssistant && messageHasActiveToolCall(message)
  const showSkeleton =
    isStreamingAssistant &&
    !text &&
    !isToolRunning &&
    charts.length === 0 &&
    reasoning === null

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

      {reasoning && (
        <AiReasoningBlock
          text={reasoning.text}
          isStreaming={reasoning.isStreaming && isStreamingAssistant}
        />
      )}

      {charts.map((chart) => (
        <AiChartRenderer key={chart.id} spec={chart.spec} />
      ))}

      {showSkeleton ? (
        <div className="space-y-2">
          <div className="h-3 w-4/5 animate-pulse rounded bg-vscode-border/60" />
          <div className="h-3 w-3/5 animate-pulse rounded bg-vscode-border/60" />
        </div>
      ) : isToolRunning ? (
        <p className="flex items-center gap-2 text-sm text-vscode-text-muted">
          <span
            className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent"
            aria-hidden
          />
          {getRunningToolLabel(message)}
        </p>
      ) : isUser ? (
        <p className="whitespace-pre-wrap break-words text-sm text-vscode-text">{text}</p>
      ) : (
        <AiMarkdown
          content={text || (isStreamingAssistant && charts.length === 0 ? '…' : '')}
        />
      )}

      {isAwaitingAnalysis && (
        <p className="mt-3 flex items-center gap-2 border-t border-vscode-border/50 pt-2 text-xs text-vscode-text-muted">
          <span
            className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent"
            aria-hidden
          />
          Analisando seus dados em segundo plano. Você pode navegar pelo sistema —
          avisamos por notificação quando terminar.
        </p>
      )}
    </article>
  )
}
