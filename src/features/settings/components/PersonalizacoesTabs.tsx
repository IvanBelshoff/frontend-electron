import clsx from 'clsx'
import type { ReactNode } from 'react'
import { BellIcon, PaletteIcon } from '@/components/settings/SettingsIcons'
import type { PersonalizacoesTab } from '@/features/settings/personalizacoes-types'

type PersonalizacoesTabsProps = {
  activeTab: PersonalizacoesTab
  onChange: (tab: PersonalizacoesTab) => void
}

function TableIcon({ className = 'h-[1.35rem] w-[1.35rem]' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3v18" />
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 9h18" />
      <path d="M3 15h18" />
    </svg>
  )
}

const tabs: {
  id: PersonalizacoesTab
  label: string
  icon: (props: { className?: string }) => ReactNode
}[] = [
  {
    id: 'theme',
    label: 'Tema',
    icon: ({ className }) => <PaletteIcon className={className} />,
  },
  {
    id: 'notification',
    label: 'Notificação',
    icon: ({ className }) => <BellIcon className={className} />,
  },
  {
    id: 'tables',
    label: 'Tabelas',
    icon: ({ className }) => <TableIcon className={className} />,
  },
]

export default function PersonalizacoesTabs({ activeTab, onChange }: PersonalizacoesTabsProps) {
  return (
    <div className="flex justify-center">
      <div
        className="inline-flex w-full max-w-2xl rounded-lg border border-vscode-border bg-vscode-input-bg/50 p-1"
        role="tablist"
        aria-label="Seções de personalização"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={clsx(
                'inline-flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors sm:px-5',
                isActive
                  ? 'border border-vscode-accent bg-vscode-accent/10 text-vscode-text shadow-sm'
                  : 'border border-transparent text-vscode-text-muted hover:bg-vscode-sidebar hover:text-vscode-text',
              )}
            >
              {tab.icon({ className: 'h-[1.35rem] w-[1.35rem]' })}
              <span className="truncate">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
