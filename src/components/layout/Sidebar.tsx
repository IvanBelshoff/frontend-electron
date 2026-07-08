import clsx from 'clsx'
import { useState } from 'react'
import {
  ChartBarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DatabaseIcon,
  LayoutDashboardIcon,
  MyReportsIcon,
  SettingsIcon,
  SignOutIcon,
  TableChartIcon,
  UsersIcon,
} from '@/components/layout/SidebarIcons'
import SidebarNavItem from '@/components/layout/SidebarNavItem'
import SidebarProfile from '@/components/layout/SidebarProfile'
import { readSidebarExpanded, writeSidebarExpanded } from '@/components/layout/sidebar-utils'
import { useAuth } from '@/features/auth/use-auth'
import { useNavigate } from '@tanstack/react-router'

const MAIN_NAV = [
  { to: '/', label: 'Meus Dashboards', icon: <LayoutDashboardIcon />, exact: true },
  { to: '/relatorios', label: 'Meus Relatórios', icon: <MyReportsIcon />, exact: true },
  { to: '/dashboards', label: 'Gerenciar Dashboards', icon: <ChartBarIcon /> },
  { to: '/relatorios/gerenciar', label: 'Gerenciar Relatórios', icon: <TableChartIcon /> },
  { to: '/conexoes', label: 'Gerenciar Conexões', icon: <DatabaseIcon /> },
  { to: '/usuarios', label: 'Gerenciar Usuários', icon: <UsersIcon /> },
] as const

export default function Sidebar() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(readSidebarExpanded)

  function toggleExpanded() {
    setExpanded((current) => {
      const next = !current
      writeSidebarExpanded(next)
      return next
    })
  }

  async function handleLogout() {
    await logout()
    void navigate({ to: '/login' })
  }

  return (
    <aside
      className={clsx(
        'flex shrink-0 flex-col border-r border-vscode-border bg-vscode-sidebar transition-[width] duration-200 ease-in-out',
        expanded ? 'w-60' : 'w-14',
      )}
    >
      <SidebarProfile expanded={expanded} />

      <div className={clsx('pt-2 pb-2', expanded ? 'px-2' : 'px-1')}>
        <button
          type="button"
          onClick={toggleExpanded}
          title={expanded ? 'Recolher barra lateral' : 'Expandir barra lateral'}
          aria-label={expanded ? 'Recolher barra lateral' : 'Expandir barra lateral'}
          className={clsx(
            'flex items-center rounded text-sm text-vscode-text-muted transition-colors hover:bg-vscode-activity-bar hover:text-vscode-text',
            expanded ? 'w-full gap-3 px-3 py-2' : 'mx-auto h-9 w-9 justify-center',
          )}
        >
          <span className="flex h-4 w-4 shrink-0 items-center justify-center">
            {expanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </span>
          {expanded && <span>Recolher</span>}
        </button>
      </div>

      <nav
        className={clsx('flex flex-1 flex-col gap-1 py-1', expanded ? 'px-2' : 'px-1')}
        aria-label="Navegação principal"
      >
        {MAIN_NAV.map((item) => (
          <SidebarNavItem
            key={item.to}
            to={item.to}
            label={item.label}
            icon={item.icon}
            exact={'exact' in item ? item.exact : false}
            expanded={expanded}
          />
        ))}
      </nav>

      <div
        className={clsx(
          'flex flex-col gap-1 border-t border-vscode-border py-3',
          expanded ? 'px-2' : 'px-1',
        )}
      >
        <SidebarNavItem
          to="/configuracoes"
          label="Configurações"
          icon={<SettingsIcon />}
          expanded={expanded}
        />

        <button
          type="button"
          onClick={() => void handleLogout()}
          title="Sair"
          aria-label="Sair"
          className={clsx(
            'flex items-center rounded text-sm text-vscode-text transition-colors hover:bg-vscode-activity-bar',
            expanded ? 'w-full gap-3 px-3 py-2' : 'mx-auto h-9 w-9 justify-center',
          )}
        >
          <span className="flex h-4 w-4 shrink-0 items-center justify-center text-vscode-text-muted">
            <SignOutIcon />
          </span>
          {expanded && <span>Sair</span>}
        </button>
      </div>
    </aside>
  )
}
