import {
  Outlet,
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router'
import { authStore } from '@/features/auth/auth-store'
import {
  CONNECTION_RBAC,
  DASHBOARD_RBAC,
  METRICS_RBAC,
  JOBS_RBAC,
  REPORT_RBAC,
  USER_RBAC,
} from '@/features/auth/rbac-requirements'
import { requirePermission, requireRole } from '@/features/auth/route-guards'
import AppShell from '@/layouts/AppShell'
import MetricasPage from '@/pages/MetricasPage'
import JobsPage from '@/pages/JobsPage'
import AiChatTestPage from '@/pages/AiChatTestPage'
import ConfiguracoesPage from '@/pages/ConfiguracoesPage'
import CriarConexaoPage from '@/pages/CriarConexaoPage'
import CriarDashboardPage from '@/pages/CriarDashboardPage'
import CriarRelatorioPage from '@/pages/CriarRelatorioPage'
import CriarUsuarioPage from '@/pages/CriarUsuarioPage'
import EditarConexaoPage from '@/pages/EditarConexaoPage'
import EditarDashboardPage from '@/pages/EditarDashboardPage'
import EditarRelatorioPage from '@/pages/EditarRelatorioPage'
import GerenciarConexoesPage from '@/pages/GerenciarConexoesPage'
import GerenciarDashboardsPage from '@/pages/GerenciarDashboardsPage'
import GerenciarRelatoriosPage from '@/pages/GerenciarRelatoriosPage'
import EditarUsuarioPage from '@/pages/EditarUsuarioPage'
import GerenciarUsuariosPage from '@/pages/GerenciarUsuariosPage'
import LoginPage from '@/pages/LoginPage'
import ExecutarRelatorioPage from '@/pages/ExecutarRelatorioPage'
import MeusDashboardsPage from '@/pages/MeusDashboardsPage'
import MeusRelatoriosPage from '@/pages/MeusRelatoriosPage'
import VisualizarDashboardPage from '@/pages/VisualizarDashboardPage'

const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  component: AppShell,
  beforeLoad: () => {
    if (authStore.getIsBootstrapping()) {
      return
    }

    if (!authStore.isAuthenticated()) {
      throw redirect({ to: '/login' })
    }
  },
})

const meusDashboardsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/',
  component: MeusDashboardsPage,
})

const gerenciarDashboardsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/dashboards',
  component: GerenciarDashboardsPage,
  beforeLoad: () => {
    requireRole(DASHBOARD_RBAC.menuRole)
  },
})

const criarDashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/dashboards/novo',
  component: CriarDashboardPage,
  beforeLoad: () => {
    requireRole(DASHBOARD_RBAC.menuRole)
    requirePermission(DASHBOARD_RBAC.create, '/dashboards')
  },
})

const editarDashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/dashboards/$dashboardId/editar',
  component: EditarDashboardPage,
  beforeLoad: () => {
    requireRole(DASHBOARD_RBAC.menuRole)
    requirePermission(DASHBOARD_RBAC.update, '/dashboards')
  },
})

const visualizarDashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/dashboards/$dashboardId/visualizar',
  component: VisualizarDashboardPage,
})

const meusRelatoriosRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/relatorios',
  component: MeusRelatoriosPage,
})

const executarRelatorioRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/relatorios/$relatorioId/executar',
  component: ExecutarRelatorioPage,
})

const gerenciarRelatoriosRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/relatorios/gerenciar',
  component: GerenciarRelatoriosPage,
  beforeLoad: () => {
    requireRole(REPORT_RBAC.menuRole)
  },
})

const criarRelatorioRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/relatorios/novo',
  component: CriarRelatorioPage,
  beforeLoad: () => {
    requireRole(REPORT_RBAC.menuRole)
    requirePermission(REPORT_RBAC.create, '/relatorios/gerenciar')
  },
})

const editarRelatorioRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/relatorios/$relatorioId/editar',
  component: EditarRelatorioPage,
  beforeLoad: () => {
    requireRole(REPORT_RBAC.menuRole)
    requirePermission(REPORT_RBAC.update, '/relatorios/gerenciar')
  },
})

const gerenciarConexoesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/conexoes',
  component: GerenciarConexoesPage,
  beforeLoad: () => {
    requireRole(CONNECTION_RBAC.menuRole)
  },
})

const criarConexaoRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/conexoes/nova',
  component: CriarConexaoPage,
  beforeLoad: () => {
    requireRole(CONNECTION_RBAC.menuRole)
    requirePermission(CONNECTION_RBAC.create, '/conexoes')
  },
})

const editarConexaoRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/conexoes/$conexaoId/editar',
  component: EditarConexaoPage,
  beforeLoad: () => {
    requireRole(CONNECTION_RBAC.menuRole)
    requirePermission(CONNECTION_RBAC.update, '/conexoes')
  },
})

const gerenciarUsuariosRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/usuarios',
  component: GerenciarUsuariosPage,
  beforeLoad: () => {
    requireRole(USER_RBAC.menuRole)
  },
})

const criarUsuarioRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/usuarios/criar',
  component: CriarUsuarioPage,
  beforeLoad: () => {
    requireRole(USER_RBAC.menuRole)
    requirePermission(USER_RBAC.create, '/usuarios')
  },
})

const editarUsuarioRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/usuarios/$userId/editar',
  component: EditarUsuarioPage,
  beforeLoad: () => {
    requireRole(USER_RBAC.menuRole)
    requirePermission(USER_RBAC.update, '/usuarios')
  },
})

const configuracoesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/configuracoes',
  component: ConfiguracoesPage,
})

const aiChatRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/ai-chat',
  component: AiChatTestPage,
})

const jobsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/jobs',
  component: JobsPage,
  beforeLoad: () => {
    requireRole(JOBS_RBAC.menuRole)
  },
})

const metricasRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/metricas',
  component: MetricasPage,
  beforeLoad: () => {
    requireRole(METRICS_RBAC.menuRole)
  },
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
  beforeLoad: () => {
    if (authStore.getIsBootstrapping()) {
      return
    }

    if (authStore.isAuthenticated()) {
      throw redirect({ to: '/' })
    }
  },
})

const routeTree = rootRoute.addChildren([
  authenticatedRoute.addChildren([
    meusDashboardsRoute,
    gerenciarDashboardsRoute,
    criarDashboardRoute,
    editarDashboardRoute,
    visualizarDashboardRoute,
    meusRelatoriosRoute,
    executarRelatorioRoute,
    gerenciarRelatoriosRoute,
    criarRelatorioRoute,
    editarRelatorioRoute,
    gerenciarConexoesRoute,
    criarConexaoRoute,
    editarConexaoRoute,
    gerenciarUsuariosRoute,
    criarUsuarioRoute,
    editarUsuarioRoute,
    configuracoesRoute,
    aiChatRoute,
    jobsRoute,
    metricasRoute,
  ]),
  loginRoute,
])

export const router = createRouter({
  routeTree,
  history: createHashHistory(),
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
