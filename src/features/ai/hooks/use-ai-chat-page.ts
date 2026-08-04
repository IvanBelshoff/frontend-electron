import { useChat } from '@ai-sdk/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  createAiThread,
  getAiThreadMessages,
  listAiThreads,
} from '@/features/ai/ai-chat-api'
import { createAiChatTransport } from '@/features/ai/ai-chat-transport'
import type { AiChatMode, AiChatThread } from '@/features/ai/ai-chat-types'
import { getPendingAnalysisJobIds, hasBlockingPlanOrAnalysis } from '@/features/ai/ai-chat-utils'
import type { AiMention } from '@/features/ai/ai-mention-types'
import { useAuth } from '@/features/auth/auth-context'
import { boostInboxPolling } from '@/features/user-inbox/inbox-polling'
import { queryKeys } from '@/lib/query-keys'

/** Intervalo de checagem do resultado de uma análise que roda na fila. */
const PENDING_ANALYSIS_POLL_INTERVAL_MS = 5000

type UseAiChatPageOptions = {
  mode: AiChatMode
  thinking: boolean
  /** Conversa a abrir na montagem (deep-link de notificação de análise). */
  initialThreadId?: string
}

export function useAiChatPage({
  mode,
  thinking,
  initialThreadId,
}: UseAiChatPageOptions) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.sub ?? null
  const threadsQueryKey = queryKeys.ai.threads(userId)
  const [activeThreadId, setActiveThreadId] = useState<string | undefined>()
  const [isHydratingMessages, setIsHydratingMessages] = useState(false)
  const [pendingMentions, setPendingMentions] = useState<AiMention[]>([])
  const activeThreadIdRef = useRef<string | undefined>(activeThreadId)
  const pendingMentionsRef = useRef<AiMention[]>([])
  const modeRef = useRef<AiChatMode>(mode)
  const thinkingRef = useRef<boolean>(thinking)

  useEffect(() => {
    activeThreadIdRef.current = activeThreadId
  }, [activeThreadId])

  useEffect(() => {
    pendingMentionsRef.current = pendingMentions
  }, [pendingMentions])

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    thinkingRef.current = thinking
  }, [thinking])

  const threadsQuery = useQuery({
    queryKey: threadsQueryKey,
    queryFn: listAiThreads,
    enabled: Boolean(userId),
  })

  const transport = useMemo(
    () =>
      createAiChatTransport({
        getThreadId: () => activeThreadIdRef.current,
        getMentions: () => pendingMentionsRef.current,
        getMode: () => modeRef.current,
        getThinking: () => thinkingRef.current,
        onThreadId: (threadId) => {
          if (!activeThreadIdRef.current) {
            activeThreadIdRef.current = threadId
            setActiveThreadId(threadId)
          }
          void queryClient.invalidateQueries({ queryKey: threadsQueryKey })
        },
        onThreadTitle: (threadId, title) => {
          queryClient.setQueryData<AiChatThread[]>(threadsQueryKey, (current) => {
            if (!current) {
              return current
            }

            return current.map((thread) =>
              thread.id === threadId ? { ...thread, titulo: title } : thread,
            )
          })
        },
      }),
    [queryClient, threadsQueryKey],
  )

  const { messages, sendMessage, status, error, stop, setMessages } = useChat({ transport })

  const isBusy = status === 'submitted' || status === 'streaming'
  const prevStatusRef = useRef(status)

  const hydrateThread = useCallback(
    async (threadId: string, options: { silent?: boolean } = {}) => {
      if (!options.silent) {
        setIsHydratingMessages(true)
      }

      try {
        const response = await getAiThreadMessages(threadId)
        setMessages(response.messages)
      } finally {
        if (!options.silent) {
          setIsHydratingMessages(false)
        }
      }
    },
    [setMessages],
  )

  // Após o stream, reidrata para pegar data-plan/metadata persistidos (card interativo).
  useEffect(() => {
    const wasBusy =
      prevStatusRef.current === 'submitted' || prevStatusRef.current === 'streaming'
    prevStatusRef.current = status

    if (!wasBusy || isBusy || !activeThreadIdRef.current) {
      return
    }

    void hydrateThread(activeThreadIdRef.current, { silent: true })
  }, [hydrateThread, isBusy, status])

  const selectThread = useCallback(
    async (thread: AiChatThread) => {
      setActiveThreadId(thread.id)
      setPendingMentions([])
      await hydrateThread(thread.id)
    },
    [hydrateThread],
  )

  useEffect(() => {
    if (!initialThreadId || activeThreadIdRef.current === initialThreadId) {
      return
    }

    setActiveThreadId(initialThreadId)
    activeThreadIdRef.current = initialThreadId
    void hydrateThread(initialThreadId)
  }, [hydrateThread, initialThreadId])

  const pendingAnalysisJobIds = useMemo(
    () => getPendingAnalysisJobIds(messages),
    [messages],
  )
  const hasPendingAnalysis = hasBlockingPlanOrAnalysis(messages)

  // Enquanto a análise/plano roda na fila, o resultado chega por outra mensagem
  // persistida — só reidratando o thread para vê-la.
  useEffect(() => {
    if (!hasPendingAnalysis || !activeThreadId || isBusy) {
      return
    }

    // A notificação de conclusão chega junto: acelera o polling do sino.
    boostInboxPolling()

    const interval = setInterval(() => {
      void hydrateThread(activeThreadId, { silent: true })
    }, PENDING_ANALYSIS_POLL_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [activeThreadId, hasPendingAnalysis, hydrateThread, isBusy])

  const startNewConversation = useCallback(() => {
    setActiveThreadId(undefined)
    setPendingMentions([])
    setMessages([])
  }, [setMessages])

  const createThreadMutation = useMutation({
    mutationFn: () => createAiThread(),
    onSuccess: async (thread) => {
      await queryClient.invalidateQueries({ queryKey: threadsQueryKey })
      setActiveThreadId(thread.id)
      setPendingMentions([])
      setMessages([])
    },
  })

  const sendUserMessage = useCallback(
    async (text: string, mentions: AiMention[] = []) => {
      const trimmed = text.trim()
      if (!trimmed || isBusy || hasPendingAnalysis) {
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
      void queryClient.invalidateQueries({ queryKey: threadsQueryKey })
    },
    [hasPendingAnalysis, isBusy, queryClient, sendMessage, threadsQueryKey],
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
    pendingAnalysisJobIds,
    hasPendingAnalysis,
    selectThread,
    startNewConversation,
    createThread: () => createThreadMutation.mutateAsync(),
    isCreatingThread: createThreadMutation.isPending,
    sendUserMessage,
    stop,
    refreshActiveThread: () =>
      activeThreadId ? hydrateThread(activeThreadId, { silent: true }) : Promise.resolve(),
  }
}
