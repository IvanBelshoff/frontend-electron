import { DefaultChatTransport } from 'ai'
import { authStore } from '@/features/auth/auth-store'
import type { AiMention } from '@/features/ai/ai-mention-types'
import { getApiUrl } from '@/lib/config'

type AiChatTransportOptions = {
  getThreadId: () => string | undefined
  getMentions: () => AiMention[]
  onThreadId?: (threadId: string) => void
  onThreadTitle?: (threadId: string, title: string) => void
}

export function createAiChatTransport({
  getThreadId,
  getMentions,
  onThreadId,
  onThreadTitle,
}: AiChatTransportOptions) {
  return new DefaultChatTransport({
    api: `${getApiUrl()}/ai/chat`,
    credentials: 'include',
    prepareSendMessagesRequest: ({ messages, body }) => {
      const token = authStore.getAccessToken()
      const threadId = getThreadId()
      const mentions = getMentions()
      const headers: Record<string, string> = {}

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      // #region agent log
      fetch('http://127.0.0.1:7570/ingest/0db2c04a-a5ac-44c9-a409-caf72cacc101',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'dcbb51'},body:JSON.stringify({sessionId:'dcbb51',runId:'pre-fix',hypothesisId:'A',location:'ai-chat-transport.ts:prepareSend',message:'mentions in outbound chat body',data:{mentionCount:mentions.length,mentions:mentions.map((m)=>({type:m.type,id:m.id??null,label:m.label})),hasThreadId:Boolean(threadId),messageCount:messages.length},timestamp:Date.now()})}).catch(()=>{})
      // #endregion

      return {
        headers,
        body: {
          ...body,
          messages,
          ...(threadId ? { threadId } : {}),
          ...(mentions.length > 0 ? { mentions } : {}),
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
