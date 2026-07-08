import clsx from 'clsx'
import type { ReportEditTab } from '@/features/reports/report-types'
import { DashboardMaterialIcon } from '@/features/dashboards/icons/DashboardIcons'

type ReportEditTabsProps = {
  activeTab: ReportEditTab
  onChange: (tab: ReportEditTab) => void
}

const tabs: { id: ReportEditTab; label: string; icon: string }[] = [
  { id: 'report', label: 'Relatório', icon: 'table_chart' },
  { id: 'access', label: 'Acessos', icon: 'group' },
  { id: 'execution', label: 'Execução', icon: 'play_circle' },
]

export default function ReportEditTabs({ activeTab, onChange }: ReportEditTabsProps) {
  return (
    <div className="flex justify-center">
      <div
        className="inline-flex rounded-lg border border-vscode-border bg-vscode-input-bg/50 p-1"
        role="tablist"
        aria-label="Seções do relatório"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'inline-flex min-w-[8.5rem] items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'border border-vscode-accent bg-vscode-accent/10 text-vscode-text shadow-sm'
                : 'border border-transparent text-vscode-text-muted hover:bg-vscode-sidebar hover:text-vscode-text',
            )}
          >
            <DashboardMaterialIcon
              name={tab.icon}
              className="text-[1.35rem]"
              filled={activeTab === tab.id}
            />
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
