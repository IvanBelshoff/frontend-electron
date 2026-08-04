import { useEffect, useRef } from 'react'
import type { ChatStatus, UIMessage } from 'ai'
import AiMessageBubble from '@/features/ai/components/AiMessageBubble'

type AiMessageListProps = {
  messages: UIMessage[]
  status: ChatStatus
  isHydrating?: boolean
  pendingAnalysisJobIds?: string[]
  threadId?: string
  onPlanChanged?: () => void
}

function PendingAssistantBubble() {
  return (
    <article className="mr-auto max-w-[85%] rounded-lg border border-vscode-border bg-vscode-input-bg/40 px-4 py-3">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-vscode-text-muted">
        Assistente
      </p>
      <p className="flex items-center gap-2 text-sm text-vscode-text-muted">
        <span
          className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden
        />
        Pensando e montando o plano…
      </p>
    </article>
  )
}

export default function AiMessageList({
  messages,
  status,
  isHydrating = false,
  pendingAnalysisJobIds = [],
  threadId,
  onPlanChanged,
}: AiMessageListProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const isBusy = status === 'submitted' || status === 'streaming'
  const lastMessage = messages[messages.length - 1]
  const showPendingBubble =
    isBusy && (!lastMessage || lastMessage.role === 'user')

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, status, showPendingBubble])

  if (isHydrating) {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center p-6 text-sm text-vscode-text-muted">
        Carregando conversa...
      </div>
    )
  }

  return (
    <div ref={scrollRef} className="h-full min-h-0 overflow-y-auto p-4">
      <div className="space-y-4">
        {messages.map((message, index) => (
          <AiMessageBubble
            key={message.id}
            message={message}
            status={status}
            isLastAssistant={
              message.role === 'assistant' &&
              messages.slice(index + 1).every((item) => item.role !== 'assistant')
            }
            pendingAnalysisJobIds={pendingAnalysisJobIds}
            threadId={threadId}
            onPlanChanged={onPlanChanged}
          />
        ))}
        {showPendingBubble && <PendingAssistantBubble />}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
