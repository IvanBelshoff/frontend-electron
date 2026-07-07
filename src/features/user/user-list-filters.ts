import { getRegrasPermissoes } from '@/lib/config'
import type { ListUsersParams } from '@/features/user/user-api'

export type UserFilters = {
  bloqueado: 'all' | boolean
  regra: 'all' | string
  permissao: 'all' | string
}

export const DEFAULT_USER_FILTERS: UserFilters = {
  bloqueado: 'all',
  regra: 'all',
  permissao: 'all',
}

export function areUserFiltersEqual(a: UserFilters, b: UserFilters): boolean {
  return (
    a.bloqueado === b.bloqueado && a.regra === b.regra && a.permissao === b.permissao
  )
}

export function hasActiveUserFilters(filters: UserFilters): boolean {
  return !areUserFiltersEqual(filters, DEFAULT_USER_FILTERS)
}

export function getUserRoleFilterOptions(): string[] {
  return Object.keys(getRegrasPermissoes()).sort()
}

export function getUserPermissionFilterOptions(): string[] {
  const catalog = getRegrasPermissoes()
  const permissions = new Set<string>()

  Object.values(catalog).forEach((rulePermissions) => {
    rulePermissions.forEach((permission) => permissions.add(permission))
  })

  return Array.from(permissions).sort()
}

export function buildUserListQueryParams(
  search: string,
  filters: UserFilters,
  limit = 100,
): ListUsersParams {
  const params: ListUsersParams = {
    page: 1,
    limit,
  }

  const normalizedSearch = search.trim()
  if (normalizedSearch) {
    params.filter = normalizedSearch
  }

  if (filters.bloqueado !== 'all') {
    params.bloqueado = filters.bloqueado
  }

  if (filters.regra !== 'all') {
    params.regra = filters.regra
  }

  if (filters.permissao !== 'all') {
    params.permissao = filters.permissao
  }

  return params
}
