import { useEffect, useRef } from 'react'
import type { ChatStatus, UIMessage } from 'ai'
import AiMessageBubble from '@/features/ai/components/AiMessageBubble'

type AiMessageListProps = {
  messages: UIMessage[]
  status: ChatStatus
  isHydrating?: boolean
  threadId?: string
  onChipClick?: (value: string) => void
  onExploreRefresh?: () => void
}

export default function AiMessageList({
  messages,
  status,
  isHydrating = false,
  threadId,
  onChipClick,
  onExploreRefresh,
}: AiMessageListProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, status])

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
            threadId={threadId}
            onChipClick={onChipClick}
            onExploreRefresh={onExploreRefresh}
            isLastAssistant={
              message.role === 'assistant' &&
              messages.slice(index + 1).every((item) => item.role !== 'assistant')
            }
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
