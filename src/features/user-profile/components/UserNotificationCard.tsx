import { Link } from '@tanstack/react-router'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import {
  canDownloadNotification,
  canOpenReportNotification,
  getNotificationKindLabel,
  getNotificationOrigemLabel,
  getNotificationReportName,
  getNotificationSummary,
  getNotificationTone,
  getOpenReportButtonLabel,
} from '@/features/user-inbox/notification-display'
import type { UserInboxItem } from '@/features/user-inbox/user-inbox-types'
import { formatDateTime } from '@/lib/datetime'
import clsx from 'clsx'

type UserNotificationCardProps = {
  item: UserInboxItem
  compact?: boolean
  downloading?: boolean
  onDownload: (item: UserInboxItem) => void
  onMarkRead: (notificationId: string) => void
  onOpenReport: (item: UserInboxItem) => void
}

const toneIconClasses: Record<ReturnType<typeof getNotificationTone>, string> = {
  success: 'bg-emerald-500/20 text-emerald-400',
  info: 'bg-sky-500/20 text-sky-400',
  error: 'bg-red-500/20 text-red-400',
}

function NotificationIcon({ tone }: { tone: ReturnType<typeof getNotificationTone> }) {
  return (
    <span
      className={clsx(
        'mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
        toneIconClasses[tone],
      )}
      aria-hidden="true"
    >
      {tone === 'success' ? '✓' : tone === 'error' ? '!' : 'i'}
    </span>
  )
}

export default function UserNotificationCard({
  item,
  compact = false,
  downloading = false,
  onDownload,
  onMarkRead,
  onOpenReport,
}: UserNotificationCardProps) {
  const tone = getNotificationTone(item)
  const reportName = getNotificationReportName(item)
  const summary = getNotificationSummary(item)
  const kindLabel = getNotificationKindLabel(item)
  const origemLabel = getNotificationOrigemLabel(item.payload.origem)
  const showDownload = canDownloadNotification(item)
  const showOpenReport = canOpenReportNotification(item)
  const openReportLabel = getOpenReportButtonLabel(item)
  const isFailed = tone === 'error'

  return (
    <div
      className={clsx(
        'rounded border border-vscode-border bg-vscode-sidebar/60',
        compact ? 'p-2' : 'p-3',
      )}
    >
      <div className="flex items-start gap-2">
        {!item.readAt && (
          <span className="mt-2 inline-flex h-2 w-2 shrink-0 rounded-full bg-red-500" />
        )}
        <NotificationIcon tone={tone} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-vscode-text">{item.title}</p>
          <p className="mt-1 text-xs text-vscode-text">
            Relatório: <span className="font-medium">{reportName}</span>
          </p>
          {summary && (
            <p
              className={clsx(
                'mt-1 line-clamp-2 text-xs',
                isFailed ? 'text-red-400' : 'text-vscode-text-muted',
              )}
            >
              {summary}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-1">
            <Badge variant={tone === 'error' ? 'danger' : tone === 'success' ? 'success' : 'info'}>
              {kindLabel}
            </Badge>
            {origemLabel && <Badge variant="neutral">{origemLabel}</Badge>}
            {item.payload.fileName && (
              <Badge variant="neutral" title={item.payload.fileName}>
                {item.payload.fileName}
              </Badge>
            )}
            {item.payload.parametrosResumo && (
              <Badge variant="neutral" title={item.payload.parametrosResumo}>
                {item.payload.parametrosResumo}
              </Badge>
            )}
          </div>
          <p className="mt-2 text-[10px] text-vscode-text-muted">
            {formatDateTime(item.createdAt)}
          </p>
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-1">
        {showDownload && (
          <Button
            type="button"
            size="sm"
            className="w-full"
            loading={downloading}
            onClick={() => onDownload(item)}
          >
            Baixar
          </Button>
        )}

        {showOpenReport && item.payload.relatorioId && (
          <Link
            to="/relatorios/$relatorioId/executar"
            params={{ relatorioId: String(item.payload.relatorioId) }}
            className="w-full"
            onClick={() => onOpenReport(item)}
          >
            <Button type="button" variant="secondary" size="sm" className="w-full">
              {openReportLabel}
            </Button>
          </Link>
        )}

        {!item.readAt && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => onMarkRead(item.id)}
          >
            Lida
          </Button>
        )}
      </div>
    </div>
  )
}
