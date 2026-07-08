import ReportFormBreadcrumb from '@/features/reports/components/ReportFormBreadcrumb'

export default function ReportCreateHeader() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <ReportFormBreadcrumb
        parent={{ label: 'Gerenciamento de Relatórios', to: '/relatorios/gerenciar' }}
        current="Criar relatório"
      />
    </header>
  )
}
