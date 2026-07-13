import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import { ApiError } from '@/features/auth/auth-types'
import { useUnreadNotifications } from '@/features/user-inbox/hooks/use-unread-notifications'
import {
  listUserNotifications,
  markAllUserNotificationsRead,
  markUserNotificationRead,
} from '@/features/user-inbox/user-inbox-api'
import type { UserInboxItem } from '@/features/user-inbox/user-inbox-types'
import { downloadReportExport } from '@/features/reports/report-job-api'
import { saveBlobAsFile } from '@/lib/api-client'
import { formatDateTime } from '@/lib/datetime'
import { queryKeys } from '@/lib/query-keys'

type UserNotificationsPanelProps = {
  enabled: boolean
  compact?: boolean
}

function canDownload(item: UserInboxItem): boolean {
  return (
    item.type === 'export_ready' &&
    item.payload.downloadAvailable === true &&
    Boolean(item.payload.jobId)
  )
}

function canOpenReport(item: UserInboxItem): boolean {
  return item.type === 'snapshot_ready' && Boolean(item.payload.relatorioId)
}

export default function UserNotificationsPanel({
  enabled,
  compact = false,
}: UserNotificationsPanelProps) {
  const queryClient = useQueryClient()
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
          <div
            key={item.id}
            className="rounded border border-vscode-border bg-vscode-sidebar/60 p-2"
          >
            <div className="flex items-start gap-2">
              {!item.readAt && (
                <span className="mt-1 inline-flex h-2 w-2 shrink-0 rounded-full bg-red-500" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-vscode-text">{item.title}</p>
                {!compact && (
                  <p className="mt-1 line-clamp-2 text-xs text-vscode-text-muted">{item.body}</p>
                )}
                <p className="mt-1 text-[10px] text-vscode-text-muted">
                  {formatDateTime(item.createdAt)}
                </p>
              </div>
            </div>

            <div className="mt-2 flex flex-col gap-1">
              {canDownload(item) && (
                <Button
                  type="button"
                  size="sm"
                  className="w-full"
                  loading={downloadingId === item.id}
                  onClick={() => void handleDownload(item)}
                >
                  Baixar
                </Button>
              )}

              {canOpenReport(item) && item.payload.relatorioId && (
                <Link
                  to="/relatorios/$relatorioId/executar"
                  params={{ relatorioId: String(item.payload.relatorioId) }}
                  className="w-full"
                  onClick={() => void handleMarkRead(item.id)}
                >
                  <Button type="button" variant="secondary" size="sm" className="w-full">
                    Abrir
                  </Button>
                </Link>
              )}

              {!item.readAt && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => void handleMarkRead(item.id)}
                >
                  Lida
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
