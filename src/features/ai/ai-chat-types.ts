import type { UIMessage } from 'ai'

export type AiChatMode = 'normal' | 'analitico'

export type AiHealthStatus = {
  available: boolean
  provider?: string
  model: string
  latencyMs: number
  error?: string
  supportsReasoning?: boolean
}

export type AiAccessStatus = {
  eligible: boolean
  reason?: string
  relatoriosDisponiveis: number
  isAdmin: boolean
}

export type AiChatThread = {
  id: string
  titulo: string
  createdAt: string
  updatedAt: string
}

export type AiThreadMessagesResponse = {
  messages: UIMessage[]
}

export type AiPlanStatus =
  | 'draft'
  | 'awaiting_approval'
  | 'approved'
  | 'running'
  | 'done'
  | 'failed'
  | 'cancelled'

export type AiPlanOption = {
  key: string
  label: string
}

export type AiPlanQuestion = {
  id: string
  texto: string
  opcoes: AiPlanOption[]
  respostaUsuario?: string
  respostaLivre?: string
}

export type AiPlanStep = {
  id: string
  titulo: string
  detalhe: string
  status?: 'pending' | 'running' | 'done' | 'skipped' | 'failed'
}

export type AiPlan = {
  id: string
  status: AiPlanStatus
  objetivo: string
  relatorioIds: number[]
  perguntas: AiPlanQuestion[]
  passos: AiPlanStep[]
  jobId?: string
  tentativas?: number
  erro?: string
  messageId?: string
}

export type UpdateAiPlanPayload = {
  objetivo?: string
  perguntas?: Array<{
    id: string
    respostaUsuario?: string
    respostaLivre?: string
  }>
  passos?: Array<{
    id: string
    titulo?: string
    detalhe?: string
  }>
}
