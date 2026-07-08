export const queryKeys = {
  auth: {
    profile: ['auth', 'profile'] as const,
  },
  user: {
    list: (params?: {
      limit?: number
      filter?: string
      bloqueado?: boolean
      regra?: string
      permissao?: string
    }) => ['user', 'list', params] as const,
    detail: (id?: number) => ['user', 'detail', id] as const,
    ids: ['user', 'ids'] as const,
    roleCatalog: ['user', 'role-catalog'] as const,
    dashboardAccess: (userId?: number) => ['user', 'dashboard-access', userId] as const,
  },
  dashboard: {
    list: (params?: { limit?: number }) => ['dashboard', 'list', params] as const,
    detail: (id: number) => ['dashboard', 'detail', id] as const,
    access: (id: number) => ['dashboard', 'access', id] as const,
    icons: (params: { page: number; limit: number; nome: string }) =>
      ['dashboard', 'icons', params] as const,
  },
  myDashboards: {
    list: (params?: {
      page?: number
      limit?: number
      nome?: string
      favoritos?: boolean
      privacidade?: string
      temporario?: boolean
    }) => ['my-dashboards', 'list', params] as const,
    detail: (id: number) => ['my-dashboards', 'detail', id] as const,
  },
  myReports: {
    list: (params?: {
      page?: number
      limit?: number
      nome?: string
      favoritos?: boolean
      privacidade?: string
      temporario?: boolean
    }) => ['my-reports', 'list', params] as const,
    detail: (id: number) => ['my-reports', 'detail', id] as const,
    data: (id: number, paramsKey?: string) => ['my-reports', 'data', id, paramsKey] as const,
    status: (id: number) => ['my-reports', 'status', id] as const,
  },
  report: {
    list: (params?: { limit?: number }) => ['report', 'list', params] as const,
    detail: (id: number) => ['report', 'detail', id] as const,
    access: (id: number) => ['report', 'access', id] as const,
    filters: (params?: Record<string, unknown>) => ['report', 'filters', params] as const,
    status: (id: number) => ['report', 'status', id] as const,
    data: (id: number, paramsKey?: string) => ['report', 'data', id, paramsKey] as const,
  },
  connection: {
    list: (params?: { limit?: number }) => ['connection', 'list', params] as const,
    detail: (id: number) => ['connection', 'detail', id] as const,
  },
  userReportAccess: (userId?: number) => ['user', 'report-access', userId] as const,
} as const
