import type { UIMessage } from 'ai'

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

function getActiveToolName(message: UIMessage): string | null {
  for (const part of message.parts) {
    if (part.type === 'tool-invocation') {
      const state = (part as { state?: string; toolName?: string }).state
      if (state === 'call' || state === 'partial-call') {
        return (part as { toolName?: string }).toolName ?? null
      }
    }

    if (
      part.type.startsWith('tool-') &&
      (part as { state?: string }).state === 'input-streaming'
    ) {
      const typed = part as { type: string; toolName?: string }
      if (typed.toolName) {
        return typed.toolName
      }
      const match = /^tool-(.+)$/.exec(typed.type)
      if (match?.[1] && match[1] !== 'invocation') {
        return match[1]
      }
    }
  }

  return null
}

export function getActiveToolStatusLabel(message: UIMessage): string {
  const toolName = getActiveToolName(message)

  if (
    toolName === 'inspecionarDashboard' ||
    toolName === 'oferecerAnaliseDashboard' ||
    toolName === 'obterMapaDashboard' ||
    toolName === 'proporPlanoAnaliseDashboard'
  ) {
    return toolName === 'proporPlanoAnaliseDashboard' ||
      toolName === 'oferecerAnaliseDashboard'
      ? 'Preparando análise do dashboard...'
      : 'Consultando dashboard...'
  }

  if (
    toolName === 'consultarRelatorio' ||
    toolName === 'descreverRelatorio' ||
    toolName === 'listarRelatoriosDisponiveis'
  ) {
    return 'Consultando relatório...'
  }

  if (toolName?.toLowerCase().includes('dashboard')) {
    return 'Consultando dashboard...'
  }

  if (toolName?.toLowerCase().includes('relatorio')) {
    return 'Consultando relatório...'
  }

  return 'Consultando dados...'
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
