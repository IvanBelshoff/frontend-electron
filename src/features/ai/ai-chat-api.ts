import { apiRequest } from '@/lib/api-client'
import type {
  AiAccessStatus,
  AiChatThread,
  AiHealthStatus,
  AiThreadMessagesResponse,
} from './ai-chat-types'
import type { AiMention } from './ai-mention-types'

export type AiMentionRelatorioApiItem = {
  id: number
  nome: string
}

export function getAiHealth(): Promise<AiHealthStatus> {
  return apiRequest<AiHealthStatus>('/ai/health')
}

export function getAiAccessStatus(): Promise<AiAccessStatus> {
  return apiRequest<AiAccessStatus>('/ai/access')
}

export function listAiMentionRelatorios(): Promise<AiMentionRelatorioApiItem[]> {
  return apiRequest<AiMentionRelatorioApiItem[]>('/ai/mentions/relatorios')
}

export function listAiThreads(): Promise<AiChatThread[]> {
  return apiRequest<AiChatThread[]>('/ai/threads')
}

export function createAiThread(titulo?: string): Promise<AiChatThread> {
  return apiRequest<AiChatThread>('/ai/threads', {
    method: 'POST',
    body: titulo ? { titulo } : {},
  })
}

export function getAiThreadMessages(threadId: string): Promise<AiThreadMessagesResponse> {
  return apiRequest<AiThreadMessagesResponse>(`/ai/threads/${threadId}/messages`)
}

export async function deleteAiThread(threadId: string): Promise<void> {
  await apiRequest<void>(`/ai/threads/${threadId}`, { method: 'DELETE' })
}

export type { AiMention }

