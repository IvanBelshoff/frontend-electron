import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import { ApiError } from '@/features/auth/auth-types'
import { downloadReportExport } from '@/features/reports/report-job-api'
import { useUnreadNotifications } from '@/features/user-inbox/hooks/use-unread-notifications'
import {
  listUserNotifications,
  markAllUserNotificationsRead,
  markUserNotificationRead,
} from '@/features/user-inbox/user-inbox-api'
import type { UserInboxItem } from '@/features/user-inbox/user-inbox-types'
import UserNotificationCard from '@/features/user-profile/components/UserNotificationCard'
import { useProfileModal } from '@/features/user-profile/profile-modal-context'
import { saveBlobAsFile } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'

type UserNotificationsPanelProps = {
  enabled: boolean
  compact?: boolean
}

export default function UserNotificationsPanel({
  enabled,
  compact = false,
}: UserNotificationsPanelProps) {
  const queryClient = useQueryClient()
  const { closeProfile } = useProfileModal()
  const { invalidateUnreadCount } = useUnreadNotifications({
    isNotificationsTabOpen: enabled,
  })
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const notificationsQuery = useQuery({
    queryKey: queryKeys.userInbox.list({ page: 1, pageSize: 50 }),
    queryFn: () => listUserNotifications({ page: 1, pageSize: 50 }),
    enabled,
  })

  const markAllMutation = useMutation({
    mutationFn: markAllUserNotificationsRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['user-inbox'] })
      invalidateUnreadCount()
    },
  })

  const handleMarkRead = async (notificationId: string) => {
    try {
      await markUserNotificationRead(notificationId)
      await queryClient.invalidateQueries({ queryKey: ['user-inbox'] })
      invalidateUnreadCount()
    } catch (error) {
      setActionError(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Não foi possível marcar a notificação como lida.',
      )
    }
  }

  const handleDownload = async (item: UserInboxItem) => {
    const jobId = item.payload.jobId

    if (!jobId) {
      return
    }

    setDownloadingId(item.id)
    setActionError(null)

    try {
      const { blob, filename } = await downloadReportExport(jobId)
      saveBlobAsFile(blob, filename)
      await handleMarkRead(item.id)
    } catch (error) {
      setActionError(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Não foi possível baixar o arquivo exportado.',
      )
    } finally {
      setDownloadingId(null)
    }
  }

  const handleOpenReport = (item: UserInboxItem) => {
    void handleMarkRead(item.id)
    closeProfile()
  }

  if (notificationsQuery.isLoading) {
    return <p className="text-xs text-vscode-text-muted">Carregando...</p>
  }

  if (notificationsQuery.isError) {
    return (
      <Alert variant="error">
        {notificationsQuery.error instanceof Error
          ? notificationsQuery.error.message
          : 'Não foi possível carregar as notificações.'}
      </Alert>
    )
  }

  const items = notificationsQuery.data?.items ?? []

  return (
    <div className="space-y-3">
      {items.some((item) => !item.readAt) && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="w-full"
          loading={markAllMutation.isPending}
          onClick={() => void markAllMutation.mutateAsync()}
        >
          Marcar todas
        </Button>
      )}

      {actionError && <Alert variant="error">{actionError}</Alert>}

      {items.length === 0 && (
        <p className="text-xs text-vscode-text-muted">Nenhuma notificação.</p>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <UserNotificationCard
            key={item.id}
            item={item}
            compact={compact}
            downloading={downloadingId === item.id}
            onDownload={(notification) => void handleDownload(notification)}
            onMarkRead={(notificationId) => void handleMarkRead(notificationId)}
            onOpenReport={handleOpenReport}
          />
        ))}
      </div>
    </div>
  )
}
