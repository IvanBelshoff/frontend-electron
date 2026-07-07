import {
  Outlet,
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router'
import { authStore } from '@/features/auth/auth-store'
import AppShell from '@/layouts/AppShell'
import ConfiguracoesPage from '@/pages/ConfiguracoesPage'
import CriarDashboardPage from '@/pages/CriarDashboardPage'
import CriarUsuarioPage from '@/pages/CriarUsuarioPage'
import EditarDashboardPage from '@/pages/EditarDashboardPage'
import GerenciarDashboardsPage from '@/pages/GerenciarDashboardsPage'
import EditarUsuarioPage from '@/pages/EditarUsuarioPage'
import GerenciarUsuariosPage from '@/pages/GerenciarUsuariosPage'
import LoginPage from '@/pages/LoginPage'
import MeusDashboardsPage from '@/pages/MeusDashboardsPage'
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
})

const criarDashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/dashboards/novo',
  component: CriarDashboardPage,
})

const editarDashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/dashboards/$dashboardId/editar',
  component: EditarDashboardPage,
})

const visualizarDashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/dashboards/$dashboardId/visualizar',
  component: VisualizarDashboardPage,
})

const gerenciarUsuariosRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/usuarios',
  component: GerenciarUsuariosPage,
})

const criarUsuarioRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/usuarios/criar',
  component: CriarUsuarioPage,
})

const editarUsuarioRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/usuarios/$userId/editar',
  component: EditarUsuarioPage,
})

const configuracoesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/configuracoes',
  component: ConfiguracoesPage,
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
    gerenciarUsuariosRoute,
    criarUsuarioRoute,
    editarUsuarioRoute,
    configuracoesRoute,
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
