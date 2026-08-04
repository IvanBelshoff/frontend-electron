import type { UIMessage } from 'ai'
import { parseAiChartSpec, type AiChartSpec } from '@/features/ai/ai-chart-types'
import type { AiPlan } from '@/features/ai/ai-chat-types'
import { parseAiTableSpec, type AiTableSpec } from '@/features/ai/ai-table-types'
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
    .replace(/<\/?tool_call>/gi, '')
    .replace(/<\/?function=[^>\s]+>/gi, '')
    .trim()
}

/** Estados de tool part (AI SDK v7) em que a execução ainda não terminou. */
const RUNNING_TOOL_STATES = new Set(['input-streaming', 'input-available'])

function isRunningToolPart(part: UIMessage['parts'][number]): boolean {
  const state = (part as { state?: string }).state

  if (part.type === 'tool-invocation') {
    return state === 'call' || state === 'partial-call'
  }

  return part.type.startsWith('tool-') && state !== undefined && RUNNING_TOOL_STATES.has(state)
}

export function messageHasActiveToolCall(message: UIMessage): boolean {
  return message.parts.some(isRunningToolPart)
}

const TOOL_PROGRESS_LABELS: Record<string, string> = {
  analisarTendencia: 'Analisando a tendência dos dados...',
  calcularCorrelacao: 'Calculando correlações...',
  detectarOutliers: 'Procurando valores atípicos...',
  resumirDistribuicao: 'Resumindo a distribuição...',
  compararPeriodos: 'Comparando períodos...',
  agendarAnaliseProfunda: 'Colocando a análise na fila...',
  graficoUsuariosPorRegra: 'Gerando gráfico de usuários por regra...',
  proporPlanoAnalise: 'Montando o plano de análise...',
  garantirSnapshot: 'Garantindo snapshot dos dados...',
  executarQuerySnapshot: 'Consultando o snapshot (DuckDB)...',
  executarQueryConexao: 'Consultando o banco do relatório...',
  visualizarDados: 'Gerando gráfico dos dados...',
  publicarTabela: 'Publicando tabela interativa...',
  descreverRelatorio: 'Lendo metadados do relatório...',
  listarRelatoriosDisponiveis: 'Listando relatórios disponíveis...',
}

/**
 * Raciocínio do modelo (ReasoningUIPart do AI SDK v7). `state` é 'streaming'
 * enquanto o modelo pensa e 'done' quando termina.
 */
export function getMessageReasoning(
  message: UIMessage,
): { text: string; isStreaming: boolean } | null {
  const parts = message.parts.filter((part) => part.type === 'reasoning')

  if (parts.length === 0) {
    return null
  }

  const text = parts.map((part) => (part as { text?: string }).text ?? '').join('')
  const isStreaming = parts.some(
    (part) => (part as { state?: string }).state === 'streaming',
  )

  return { text, isStreaming }
}

/** Rótulo de progresso da tool em execução, para feedback visual na bolha. */
export function getRunningToolLabel(message: UIMessage): string {
  const running = message.parts.find(isRunningToolPart)

  if (running?.type.startsWith('tool-')) {
    const toolName = running.type.slice('tool-'.length)
    const label = TOOL_PROGRESS_LABELS[toolName]
    if (label) {
      return label
    }
  }

  return 'Consultando relatório...'
}

/**
 * Gráficos chegam como data parts `data-chart` (AI SDK v7) tanto durante o
 * stream quanto ao reidratar a conversa, já que são persistidos em parts.
 */
export function getMessageCharts(
  message: UIMessage,
): Array<{ id: string; spec: AiChartSpec }> {
  return message.parts.flatMap((part, index) => {
    if (part.type !== 'data-chart') {
      return []
    }

    const spec = parseAiChartSpec((part as { data?: unknown }).data)
    if (!spec) {
      return []
    }

    const id = (part as { id?: string }).id ?? `${message.id}-chart-${index}`
    return [{ id, spec }]
  })
}

/**
 * Tabelas interativas chegam como data parts `data-table` (mesmo padrão dos gráficos).
 */
export function getMessageTables(
  message: UIMessage,
): Array<{ id: string; spec: AiTableSpec }> {
  return message.parts.flatMap((part, index) => {
    if (part.type !== 'data-table') {
      return []
    }

    const spec = parseAiTableSpec((part as { data?: unknown }).data)
    if (!spec) {
      return []
    }

    const id = (part as { id?: string }).id ?? `${message.id}-table-${index}`
    return [{ id, spec }]
  })
}

type AiAnalysisMetadata = {
  status: 'processing' | 'done' | 'failed'
  jobId: string
  pergunta?: string
}

function getAnalysisMetadata(message: UIMessage): AiAnalysisMetadata | null {
  const analysis = (message.metadata as { analysis?: AiAnalysisMetadata } | undefined)
    ?.analysis

  return analysis?.jobId ? analysis : null
}

/**
 * Análises em fila são append-only: a mensagem que enfileirou fica com status
 * `processing` e o worker acrescenta outra mensagem (`done`/`failed`) com o
 * mesmo jobId. Uma análise só continua pendente enquanto não houver desfecho.
 */
export function getPendingAnalysisJobIds(messages: UIMessage[]): string[] {
  const pending = new Set<string>()
  const resolved = new Set<string>()

  for (const message of messages) {
    const analysis = getAnalysisMetadata(message)
    if (!analysis) {
      continue
    }

    if (analysis.status === 'processing') {
      pending.add(analysis.jobId)
    } else {
      resolved.add(analysis.jobId)
    }
  }

  return [...pending].filter((jobId) => !resolved.has(jobId))
}

/** True quando esta bolha está aguardando o resultado da análise em fila. */
export function isMessageAwaitingAnalysis(
  message: UIMessage,
  pendingJobIds: string[],
): boolean {
  const analysis = getAnalysisMetadata(message)

  return analysis?.status === 'processing' && pendingJobIds.includes(analysis.jobId)
}

export function parseAiPlan(value: unknown): AiPlan | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const plan = value as AiPlan
  if (
    typeof plan.id !== 'string' ||
    typeof plan.status !== 'string' ||
    typeof plan.objetivo !== 'string' ||
    !Array.isArray(plan.perguntas) ||
    !Array.isArray(plan.passos)
  ) {
    return null
  }

  return plan
}

const PLAN_STATUS_RANK: Record<AiPlan['status'], number> = {
  draft: 0,
  awaiting_approval: 1,
  approved: 2,
  running: 3,
  done: 4,
  failed: 4,
  cancelled: 4,
}

function pickNewerPlan(a: AiPlan, b: AiPlan): AiPlan {
  if (a.id !== b.id) {
    return a
  }

  const rankA = PLAN_STATUS_RANK[a.status] ?? 0
  const rankB = PLAN_STATUS_RANK[b.status] ?? 0
  return rankA >= rankB ? a : b
}

export function getMessagePlan(message: UIMessage): AiPlan | null {
  let fromPart: AiPlan | null = null

  for (const part of message.parts) {
    if (part.type !== 'data-plan') {
      continue
    }
    const parsed = parseAiPlan((part as { data?: unknown }).data)
    if (parsed) {
      fromPart = fromPart ? pickNewerPlan(parsed, fromPart) : parsed
    }
  }

  const fromMeta = parseAiPlan(
    (message.metadata as { plan?: unknown } | undefined)?.plan,
  )

  if (fromMeta && fromPart) {
    return pickNewerPlan(fromMeta, fromPart)
  }

  return fromMeta ?? fromPart
}

/** Planos em execução (ou analysis processing) bloqueiam novas mensagens. */
export function hasBlockingPlanOrAnalysis(messages: UIMessage[]): boolean {
  if (getPendingAnalysisJobIds(messages).length > 0) {
    return true
  }

  return messages.some((message) => {
    const plan = getMessagePlan(message)
    return plan?.status === 'running'
  })
}

/** True se a bolha ainda não tem conteúdo útil durante o stream. */
export function messageNeedsStreamingPlaceholder(
  message: UIMessage,
  isStreamingAssistant: boolean,
): boolean {
  if (!isStreamingAssistant) {
    return false
  }

  const hasText = Boolean(getMessageText(message).trim())
  const hasPlan = Boolean(getMessagePlan(message))
  const hasCharts = getMessageCharts(message).length > 0
  const hasTables = getMessageTables(message).length > 0
  const hasReasoning = Boolean(getMessageReasoning(message)?.text.trim())
  const hasTool = messageHasActiveToolCall(message)

  return !hasText && !hasPlan && !hasCharts && !hasTables && !hasReasoning && !hasTool
}

export function formatThreadDate(value: string): string {
  const formatted = formatDateTime(value)
  return formatted === EMPTY_DATE_LABEL ? '' : formatted
}
