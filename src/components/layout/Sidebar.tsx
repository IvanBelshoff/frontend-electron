import clsx from 'clsx'
import { useState, type ReactNode } from 'react'
import {
  ActivityIcon,
  ChartBarIcon,
  ChatIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DatabaseIcon,
  LayoutDashboardIcon,
  MyReportsIcon,
  SettingsIcon,
  SignOutIcon,
  TableChartIcon,
  UsersIcon,
  WorkHistoryIcon,
} from '@/components/layout/SidebarIcons'
import SidebarNavItem from '@/components/layout/SidebarNavItem'
import type { SidebarNavMatchPattern } from '@/components/layout/sidebar-nav-utils'
import SidebarProfile from '@/components/layout/SidebarProfile'
import { readSidebarExpanded, writeSidebarExpanded } from '@/components/layout/sidebar-utils'
import { useAuth } from '@/features/auth/use-auth'
import { useAiAccess } from '@/features/ai/hooks/use-ai-access'
import {
  CONNECTION_RBAC,
  DASHBOARD_RBAC,
  AI_RBAC,
  REPORT_RBAC,
  USER_RBAC,
} from '@/features/auth/rbac-requirements'
import { hasPermission, hasRole, isAdmin } from '@/features/auth/rbac'
import { useNavigate } from '@tanstack/react-router'

type MainNavItem = {
  to: string
  label: string
  icon: ReactNode
  exact?: boolean
  alsoActiveOn?: SidebarNavMatchPattern[]
  requiredRole?: string
  requiredPermission?: string
  requiresAiEligibility?: boolean
}

const USER_NAV: MainNavItem[] = [
  {
    to: '/',
    label: 'Meus Dashboards',
    icon: <LayoutDashboardIcon />,
    exact: true,
    alsoActiveOn: [/^\/dashboards\/[^/]+\/visualizar$/],
  },
  {
    to: '/relatorios',
    label: 'Meus Relatórios',
    icon: <MyReportsIcon />,
    exact: true,
    alsoActiveOn: [/^\/relatorios\/[^/]+\/executar$/],
  },
  {
    to: '/ai-chat',
    label: 'Assistente IA',
    icon: <ChatIcon />,
    exact: true,
    requiredRole: AI_RBAC.menuRole,
    requiresAiEligibility: true,
  },
]

const MANAGE_NAV: MainNavItem[] = [
  {
    to: '/dashboards',
    label: 'Gerenciar Dashboards',
    icon: <ChartBarIcon />,
    requiredRole: DASHBOARD_RBAC.menuRole,
    exact: true,
    alsoActiveOn: ['/dashboards/novo', /^\/dashboards\/[^/]+\/editar$/],
  },
  {
    to: '/relatorios/gerenciar',
    label: 'Gerenciar Relatórios',
    icon: <TableChartIcon />,
    requiredRole: REPORT_RBAC.menuRole,
    alsoActiveOn: ['/relatorios/novo', /^\/relatorios\/[^/]+\/editar$/],
  },
  {
    to: '/conexoes',
    label: 'Gerenciar Conexões',
    icon: <DatabaseIcon />,
    requiredRole: CONNECTION_RBAC.menuRole,
    exact: true,
    alsoActiveOn: ['/conexoes/nova', /^\/conexoes\/[^/]+\/editar$/],
  },
  {
    to: '/usuarios',
    label: 'Gerenciar Usuários',
    icon: <UsersIcon />,
    requiredRole: USER_RBAC.menuRole,
    exact: true,
    alsoActiveOn: ['/usuarios/criar', /^\/usuarios\/[^/]+\/editar$/],
  },
]

export default function Sidebar() {
  const { logout, rbac } = useAuth()
  const { isEligible: isAiEligible } = useAiAccess()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(readSidebarExpanded)

  const visibleUserNavItems = USER_NAV.filter((item) => {
    if (item.requiredRole && !hasRole(rbac, item.requiredRole)) {
      return false
    }

    if (item.requiredPermission && !hasPermission(rbac, item.requiredPermission)) {
      return false
    }

    if (item.requiresAiEligibility && !isAiEligible) {
      return false
    }

    return true
  })
  const visibleManageNavItems = MANAGE_NAV.filter(
    (item) => !item.requiredRole || hasRole(rbac, item.requiredRole),
  )

  function renderNavItem(item: MainNavItem) {
    return (
      <SidebarNavItem
        key={item.to}
        to={item.to}
        label={item.label}
        icon={item.icon}
        exact={item.exact}
        alsoActiveOn={item.alsoActiveOn}
        expanded={expanded}
      />
    )
  }

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
        {visibleUserNavItems.map(renderNavItem)}

        {visibleManageNavItems.length > 0 && (
          <div
            className={clsx(
              'my-2 border-t border-vscode-border',
              expanded ? 'mx-1' : 'mx-0',
            )}
            role="separator"
            aria-hidden="true"
          />
        )}

        {visibleManageNavItems.map(renderNavItem)}
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

        {isAdmin(rbac) && (
          <>
            <SidebarNavItem
              to="/metricas"
              label="Métricas"
              icon={<ActivityIcon />}
              expanded={expanded}
            />
            <SidebarNavItem
              to="/jobs"
              label="Jobs"
              icon={<WorkHistoryIcon />}
              expanded={expanded}
            />
          </>
        )}
      </div>

      <div
        className={clsx(
          'flex flex-col gap-1 border-t border-vscode-border py-3',
          expanded ? 'px-2' : 'px-1',
        )}
      >
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
