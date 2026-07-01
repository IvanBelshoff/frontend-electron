import clsx from 'clsx'
import type { DashboardEditTab } from '@/features/dashboards/dashboard-types'
import { DashboardMaterialIcon } from '@/features/dashboards/icons/DashboardIcons'

type DashboardEditTabsProps = {
  activeTab: DashboardEditTab
  onChange: (tab: DashboardEditTab) => void
}

const tabs: { id: DashboardEditTab; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'access', label: 'Acessos', icon: 'group' },
  { id: 'preview', label: 'Preview', icon: 'preview' },
]

export default function DashboardEditTabs({ activeTab, onChange }: DashboardEditTabsProps) {
  return (
    <div className="flex justify-center">
      <div
        className="inline-flex rounded-lg border border-vscode-border bg-vscode-input-bg/50 p-1"
        role="tablist"
        aria-label="Seções do dashboard"
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
