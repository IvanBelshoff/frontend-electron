import type { UIMessage } from 'ai'

export function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join('')
}

export function messageHasActiveToolCall(message: UIMessage): boolean {
  return message.parts.some((part) => {
    if (part.type === 'tool-invocation') {
      const state = (part as { state?: string }).state
      return state === 'call' || state === 'partial-call'
    }

    return part.type.startsWith('tool-') && (part as { state?: string }).state === 'input-streaming'
  })
}

export function formatThreadDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
