import { DefaultChatTransport } from 'ai'
import { authStore } from '@/features/auth/auth-store'
import { getApiUrl } from '@/lib/config'

type AiChatTransportOptions = {
  getThreadId: () => string | undefined
  onThreadId?: (threadId: string) => void
  onThreadTitle?: (threadId: string, title: string) => void
}

export function createAiChatTransport({
  getThreadId,
  onThreadId,
  onThreadTitle,
}: AiChatTransportOptions) {
  return new DefaultChatTransport({
    api: `${getApiUrl()}/ai/chat`,
    credentials: 'include',
    prepareSendMessagesRequest: ({ messages, body }) => {
      const token = authStore.getAccessToken()
      const threadId = getThreadId()
      const headers: Record<string, string> = {}

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      return {
        headers,
        body: {
          ...body,
          messages,
          ...(threadId ? { threadId } : {}),
        },
      }
    },
    fetch: async (url, init) => {
      const response = await fetch(url, init)
      const threadId = response.headers.get('X-Thread-Id')
      const threadTitle = response.headers.get('X-Thread-Title')

      if (threadId) {
        onThreadId?.(threadId)

        if (threadTitle) {
          onThreadTitle?.(threadId, threadTitle)
        }
      }

      return response
    },
  })
}
