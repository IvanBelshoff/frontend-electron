import { useChat } from '@ai-sdk/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  createAiThread,
  getAiThreadMessages,
  listAiThreads,
} from '@/features/ai/ai-chat-api'
import { createAiChatTransport } from '@/features/ai/ai-chat-transport'
import type { AiChatThread } from '@/features/ai/ai-chat-types'
import type { AiMention } from '@/features/ai/ai-mention-types'
import { queryKeys } from '@/lib/query-keys'

export function useAiChatPage() {
  const queryClient = useQueryClient()
  const [activeThreadId, setActiveThreadId] = useState<string | undefined>()
  const [isHydratingMessages, setIsHydratingMessages] = useState(false)
  const [pendingMentions, setPendingMentions] = useState<AiMention[]>([])
  const activeThreadIdRef = useRef<string | undefined>(activeThreadId)
  const pendingMentionsRef = useRef<AiMention[]>([])

  useEffect(() => {
    activeThreadIdRef.current = activeThreadId
  }, [activeThreadId])

  useEffect(() => {
    pendingMentionsRef.current = pendingMentions
  }, [pendingMentions])

  const threadsQuery = useQuery({
    queryKey: queryKeys.ai.threads,
    queryFn: listAiThreads,
  })

  const transport = useMemo(
    () =>
      createAiChatTransport({
        getThreadId: () => activeThreadIdRef.current,
        getMentions: () => pendingMentionsRef.current,
        onThreadId: (threadId) => {
          if (!activeThreadIdRef.current) {
            activeThreadIdRef.current = threadId
            setActiveThreadId(threadId)
          }
          void queryClient.invalidateQueries({ queryKey: queryKeys.ai.threads })
        },
        onThreadTitle: (threadId, title) => {
          queryClient.setQueryData<AiChatThread[]>(queryKeys.ai.threads, (current) => {
            if (!current) {
              return current
            }

            return current.map((thread) =>
              thread.id === threadId ? { ...thread, titulo: title } : thread,
            )
          })
        },
      }),
    [queryClient],
  )

  const { messages, sendMessage, status, error, stop, setMessages } = useChat({ transport })

  const isBusy = status === 'submitted' || status === 'streaming'

  const hydrateThread = useCallback(
    async (threadId: string) => {
      setIsHydratingMessages(true)

      try {
        const response = await getAiThreadMessages(threadId)
        setMessages(response.messages)
      } finally {
        setIsHydratingMessages(false)
      }
    },
    [setMessages],
  )

  const selectThread = useCallback(
    async (thread: AiChatThread) => {
      setActiveThreadId(thread.id)
      setPendingMentions([])
      await hydrateThread(thread.id)
    },
    [hydrateThread],
  )

  const startNewConversation = useCallback(() => {
    setActiveThreadId(undefined)
    setPendingMentions([])
    setMessages([])
  }, [setMessages])

  const createThreadMutation = useMutation({
    mutationFn: () => createAiThread(),
    onSuccess: async (thread) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.ai.threads })
      setActiveThreadId(thread.id)
      setPendingMentions([])
      setMessages([])
    },
  })

  const sendUserMessage = useCallback(
    async (text: string, mentions: AiMention[] = []) => {
      const trimmed = text.trim()
      if (!trimmed || isBusy) {
        return
      }

      pendingMentionsRef.current = mentions
      setPendingMentions(mentions)

      await sendMessage({
        text: trimmed,
        metadata: mentions.length > 0 ? { mentions } : undefined,
      })

      pendingMentionsRef.current = []
      setPendingMentions([])
      void queryClient.invalidateQueries({ queryKey: queryKeys.ai.threads })
    },
    [isBusy, queryClient, sendMessage],
  )

  return {
    threads: threadsQuery.data ?? [],
    threadsLoading: threadsQuery.isLoading,
    activeThreadId,
    messages,
    status,
    error,
    isBusy,
    isHydratingMessages,
    selectThread,
    startNewConversation,
    createThread: () => createThreadMutation.mutateAsync(),
    isCreatingThread: createThreadMutation.isPending,
    sendUserMessage,
    stop,
  }
}
