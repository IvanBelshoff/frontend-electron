export const queryKeys = {
  auth: {
    profile: ['auth', 'profile'] as const,
  },
  user: {
    detail: (id?: number) => ['user', 'detail', id] as const,
  },
} as const
