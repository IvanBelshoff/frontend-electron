import type { UIMessage } from 'ai'

export type AiHealthStatus = {
  available: boolean
  model: string
  latencyMs: number
  error?: string
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
