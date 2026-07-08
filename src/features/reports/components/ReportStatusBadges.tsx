import Badge from '@/components/ui/Badge'
import {
  CalendarIcon,
  ClockIcon,
  EyeIcon,
  EyeOffIcon,
  GlobeIcon,
  LockIcon,
} from '@/features/dashboards/icons/DashboardIcons'
import type { Report } from '@/features/reports/report-types'

export type ReportStatusField = 'estado' | 'visivel' | 'privacidade' | 'temporario'

type ReportStatusBadgesProps = {
  report: Pick<Report, 'visivel' | 'privacidade' | 'temporario' | 'estado'>
  field?: ReportStatusField
}

function OnlineIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h.01" />
      <path d="M2 8.82a15 15 0 0 1 20 0" />
      <path d="M5 12.859a10 10 0 0 1 14 0" />
      <path d="M8.5 16.429a5 5 0 0 1 7 0" />
    </svg>
  )
}

function OfflineIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h.01" />
      <path d="M8.5 16.429a5 5 0 0 1 7 0" />
      <path d="M5 12.859a10 10 0 0 1 5.17-2.69" />
      <path d="M19 12.859a10 10 0 0 0-2.007-1.523" />
      <path d="M2 8.82a15 15 0 0 1 4.177-2.643" />
      <path d="M22 8.82a15 15 0 0 0-11.288-3.764" />
      <path d="m2 2 20 20" />
    </svg>
  )
}

function SnapshotIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 3v6h-6" />
    </svg>
  )
}

function getEstadoBadge(report: Pick<Report, 'estado'>) {
  if (report.estado === 'online') {
    return (
      <Badge variant="success" icon={<OnlineIcon />}>
        Online
      </Badge>
    )
  }

  if (report.estado === 'gerando_snapshot') {
    return (
      <Badge variant="warning" icon={<SnapshotIcon />}>
        Gerando snapshot
      </Badge>
    )
  }

  return (
    <Badge variant="danger" icon={<OfflineIcon />}>
      Offline
    </Badge>
  )
}

export default function ReportStatusBadges({ report, field }: ReportStatusBadgesProps) {
  if (field === 'estado') {
    return getEstadoBadge(report)
  }

  if (field === 'visivel') {
    return (
      <Badge
        variant={report.visivel ? 'success' : 'danger'}
        icon={report.visivel ? <EyeIcon /> : <EyeOffIcon />}
      >
        {report.visivel ? 'Visível' : 'Oculto'}
      </Badge>
    )
  }

  if (field === 'privacidade') {
    return (
      <Badge
        variant={report.privacidade === 'privado' ? 'warning' : 'info'}
        icon={report.privacidade === 'privado' ? <LockIcon /> : <GlobeIcon />}
      >
        {report.privacidade === 'privado' ? 'Privado' : 'Público'}
      </Badge>
    )
  }

  if (field === 'temporario') {
    return (
      <Badge
        variant={report.temporario ? 'warning' : 'success'}
        icon={report.temporario ? <ClockIcon /> : <CalendarIcon />}
      >
        {report.temporario ? 'Temporário' : 'Contínuo'}
      </Badge>
    )
  }

  return (
    <div className="flex w-full min-w-0 flex-wrap gap-2">
      <ReportStatusBadges report={report} field="estado" />
      <ReportStatusBadges report={report} field="visivel" />
      <ReportStatusBadges report={report} field="privacidade" />
      <ReportStatusBadges report={report} field="temporario" />
    </div>
  )
}
