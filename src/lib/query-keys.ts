export const queryKeys = {
  auth: {
    profile: ['auth', 'profile'] as const,
  },
  user: {
    detail: (id?: number) => ['user', 'detail', id] as const,
  },
  dashboard: {
    list: (params?: { limit?: number }) => ['dashboard', 'list', params] as const,
    detail: (id: number) => ['dashboard', 'detail', id] as const,
    access: (id: number) => ['dashboard', 'access', id] as const,
    icons: (params: { page: number; limit: number; nome: string }) =>
      ['dashboard', 'icons', params] as const,
  },
} as const
