import type { UIMessage } from 'ai'
import { EMPTY_DATE_LABEL, formatDateTime } from '@/lib/datetime'

export function getMessageText(message: UIMessage): string {
  const text = message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join('')

  const trimmed = text.trim()
  if (
    trimmed.startsWith('{') &&
    trimmed.endsWith('}') &&
    trimmed.includes('"name"') &&
    trimmed.includes('arguments')
  ) {
    try {
      const parsed = JSON.parse(trimmed) as { name?: unknown; arguments?: unknown }
      if (typeof parsed.name === 'string' && parsed.arguments != null) {
        return ''
      }
    } catch {
      /* keep original */
    }
  }

  return text
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
  const formatted = formatDateTime(value)
  return formatted === EMPTY_DATE_LABEL ? '' : formatted
}
