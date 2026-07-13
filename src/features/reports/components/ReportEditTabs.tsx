import clsx from 'clsx'
import type { ReportEditTab } from '@/features/reports/report-types'
import { DashboardMaterialIcon } from '@/features/dashboards/icons/DashboardIcons'

type ReportEditTabsProps = {
  activeTab: ReportEditTab
  onChange: (tab: ReportEditTab) => void
  disabledTabs?: ReportEditTab[]
  disabledTabTitles?: Partial<Record<ReportEditTab, string>>
}

const tabs: { id: ReportEditTab; label: string; icon: string }[] = [
  { id: 'report', label: 'Relatório', icon: 'table_chart' },
  { id: 'access', label: 'Acessos', icon: 'group' },
  { id: 'execution', label: 'Execução', icon: 'play_circle' },
  { id: 'schedule', label: 'Agendamento', icon: 'schedule' },
]

export default function ReportEditTabs({
  activeTab,
  onChange,
  disabledTabs = [],
  disabledTabTitles = {},
}: ReportEditTabsProps) {
  return (
    <div className="flex justify-center">
      <div
        className="inline-flex rounded-lg border border-vscode-border bg-vscode-input-bg/50 p-1"
        role="tablist"
        aria-label="Seções do relatório"
      >
        {tabs.map((tab) => {
          const isDisabled = disabledTabs.includes(tab.id)

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              disabled={isDisabled}
              onClick={() => onChange(tab.id)}
              title={
                isDisabled
                  ? disabledTabTitles[tab.id] ??
                    'Você não possui permissão para acessar esta seção.'
                  : undefined
              }
              className={clsx(
                'inline-flex min-w-[8.5rem] items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'border border-vscode-accent bg-vscode-accent/10 text-vscode-text shadow-sm'
                  : 'border border-transparent text-vscode-text-muted hover:bg-vscode-sidebar hover:text-vscode-text',
                isDisabled &&
                  'cursor-not-allowed opacity-50 hover:bg-transparent hover:text-vscode-text-muted',
              )}
            >
              <DashboardMaterialIcon
                name={tab.icon}
                className="text-[1.35rem]"
                filled={activeTab === tab.id}
              />
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
