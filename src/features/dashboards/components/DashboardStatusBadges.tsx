import Badge from '@/components/ui/Badge'
import type { Dashboard } from '@/features/dashboards/dashboard-types'
import {
  CalendarIcon,
  ClockIcon,
  EyeIcon,
  EyeOffIcon,
  GlobeIcon,
  LockIcon,
} from '@/features/dashboards/icons/DashboardIcons'

export type DashboardStatusField = 'visivel' | 'privacidade' | 'temporario'

type DashboardStatusBadgesProps = {
  dashboard: Dashboard
  field?: DashboardStatusField
}

export default function DashboardStatusBadges({ dashboard, field }: DashboardStatusBadgesProps) {
  if (field === 'visivel') {
    return (
      <Badge
        variant={dashboard.visivel ? 'success' : 'danger'}
        icon={dashboard.visivel ? <EyeIcon /> : <EyeOffIcon />}
      >
        {dashboard.visivel ? 'Visível' : 'Oculto'}
      </Badge>
    )
  }

  if (field === 'privacidade') {
    return (
      <Badge
        variant={dashboard.privacidade === 'privado' ? 'warning' : 'info'}
        icon={dashboard.privacidade === 'privado' ? <LockIcon /> : <GlobeIcon />}
      >
        {dashboard.privacidade === 'privado' ? 'Privado' : 'Público'}
      </Badge>
    )
  }

  if (field === 'temporario') {
    return (
      <Badge
        variant={dashboard.temporario ? 'warning' : 'success'}
        icon={dashboard.temporario ? <ClockIcon /> : <CalendarIcon />}
      >
        {dashboard.temporario ? 'Temporário' : 'Contínuo'}
      </Badge>
    )
  }

  return (
    <div className="flex w-full min-w-0 flex-wrap gap-2">
      <DashboardStatusBadges dashboard={dashboard} field="visivel" />
      <DashboardStatusBadges dashboard={dashboard} field="privacidade" />
      <DashboardStatusBadges dashboard={dashboard} field="temporario" />
    </div>
  )
}
