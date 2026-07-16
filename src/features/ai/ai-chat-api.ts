import { apiRequest } from '@/lib/api-client'
import type {
  AiAccessStatus,
  AiChatThread,
  AiThreadMessagesResponse,
} from './ai-chat-types'

export function getAiAccessStatus(): Promise<AiAccessStatus> {
  return apiRequest<AiAccessStatus>('/ai/access')
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
