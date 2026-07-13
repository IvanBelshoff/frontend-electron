import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/features/auth/use-auth'
import {
  boostInboxPolling,
  resolveInboxPollInterval,
} from '@/features/user-inbox/inbox-polling'
import { getUnreadNotificationCount } from '@/features/user-inbox/user-inbox-api'
import { queryKeys } from '@/lib/query-keys'

type UseUnreadNotificationsOptions = {
  isNotificationsTabOpen?: boolean
}

export function useUnreadNotifications(options: UseUnreadNotificationsOptions = {}) {
  const { isNotificationsTabOpen = false } = options
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isWindowVisible, setIsWindowVisible] = useState(
    () => typeof document === 'undefined' || document.visibilityState === 'visible',
  )

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsWindowVisible(document.visibilityState === 'visible')
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const unreadQuery = useQuery({
    queryKey: queryKeys.userInbox.unreadCount,
    queryFn: getUnreadNotificationCount,
    enabled: Boolean(user?.sub),
    refetchOnWindowFocus: true,
    refetchInterval: (query) =>
      resolveInboxPollInterval({
        isWindowVisible,
        isNotificationsTabOpen,
        unreadCount: query.state.data ?? 0,
      }),
  })

  const invalidateUnreadCount = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.userInbox.unreadCount })
  }, [queryClient])

  const boostPolling = useCallback(
    (durationMs = 120_000) => {
      boostInboxPolling(durationMs)
      invalidateUnreadCount()
    },
    [invalidateUnreadCount],
  )

  return useMemo(
    () => ({
      unreadCount: unreadQuery.data ?? 0,
      isLoading: unreadQuery.isLoading,
      invalidateUnreadCount,
      boostPolling,
    }),
    [boostPolling, invalidateUnreadCount, unreadQuery.data, unreadQuery.isLoading],
  )
}

export { boostInboxPolling }
