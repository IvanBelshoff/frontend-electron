import DashboardFormBreadcrumb from '@/features/dashboards/components/DashboardFormBreadcrumb'

export default function DashboardCreateHeader() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <DashboardFormBreadcrumb
        parent={{ label: 'Gerenciamento de Dashboards', to: '/dashboards' }}
        current="Criar dashboard"
      />
    </header>
  )
}
