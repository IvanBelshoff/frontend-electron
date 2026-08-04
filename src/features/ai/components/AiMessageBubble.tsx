import type { ChatStatus, UIMessage } from 'ai'
import AiChartRenderer from '@/features/ai/components/AiChartRenderer'
import AiMarkdown from '@/features/ai/components/AiMarkdown'
import AiMentionChips from '@/features/ai/components/AiMentionChips'
import AiPlanCard from '@/features/ai/components/AiPlanCard'
import AiTableRenderer from '@/features/ai/components/AiTableRenderer'
import AiReasoningBlock from '@/features/ai/components/AiReasoningBlock'
import type { AiMention } from '@/features/ai/ai-mention-types'
import {
  getMessageCharts,
  getMessagePlan,
  getMessageReasoning,
  getMessageTables,
  getMessageText,
  getRunningToolLabel,
  isMessageAwaitingAnalysis,
  messageHasActiveToolCall,
  messageNeedsStreamingPlaceholder,
} from '@/features/ai/ai-chat-utils'

type AiMessageBubbleProps = {
  message: UIMessage
  status: ChatStatus
  isLastAssistant?: boolean
  pendingAnalysisJobIds?: string[]
  threadId?: string
  onPlanChanged?: () => void
}

function getMessageMentions(message: UIMessage): AiMention[] {
  const metadata = message.metadata as { mentions?: AiMention[] } | undefined
  if (!metadata?.mentions || !Array.isArray(metadata.mentions)) {
    return []
  }
  return metadata.mentions
}

function StreamingStatus({ label }: { label: string }) {
  return (
    <p className="flex items-center gap-2 text-sm text-vscode-text-muted">
      <span
        className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent"
        aria-hidden
      />
      {label}
    </p>
  )
}

export default function AiMessageBubble({
  message,
  status,
  isLastAssistant = false,
  pendingAnalysisJobIds = [],
  threadId,
  onPlanChanged,
}: AiMessageBubbleProps) {
  const isUser = message.role === 'user'
  const isAwaitingAnalysis = isMessageAwaitingAnalysis(message, pendingAnalysisJobIds)
  const plan = isUser ? null : getMessagePlan(message)
  const text = getMessageText(message)
  const mentions = isUser ? getMessageMentions(message) : []
  const charts = isUser ? [] : getMessageCharts(message)
  const tables = isUser ? [] : getMessageTables(message)
  const reasoning = isUser ? null : getMessageReasoning(message)
  const isStreamingAssistant =
    !isUser && isLastAssistant && (status === 'submitted' || status === 'streaming')
  const isToolRunning = isStreamingAssistant && messageHasActiveToolCall(message)
  const showPlaceholder = messageNeedsStreamingPlaceholder(message, isStreamingAssistant)

  // Com plano interativo, não repetir dump markdown longo do modelo.
  const displayText =
    plan && text && /plano de an[aá]lise|perguntas para sua aprova/i.test(text)
      ? 'Preparei um plano de análise. Responda as perguntas no card abaixo e aprove para eu executar.'
      : text

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

      {tables.map((table) => (
        <AiTableRenderer key={table.id} spec={table.spec} />
      ))}

      {showPlaceholder ? (
        <StreamingStatus label="Montando o plano de análise…" />
      ) : isToolRunning ? (
        <StreamingStatus label={getRunningToolLabel(message)} />
      ) : null}

      {!showPlaceholder && !isToolRunning && isUser && (
        <p className="whitespace-pre-wrap break-words text-sm text-vscode-text">{text}</p>
      )}

      {!showPlaceholder && !isToolRunning && !isUser && displayText.trim() && (
        <AiMarkdown content={displayText} />
      )}

      {plan && threadId && onPlanChanged && (
        <AiPlanCard plan={plan} threadId={threadId} onChanged={onPlanChanged} />
      )}

      {plan && (!threadId || !onPlanChanged) && (
        <p className="mt-2 text-xs text-vscode-text-muted">
          Plano pronto — abra esta conversa novamente se o card não aparecer.
        </p>
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
