import type { AccessUser } from '@/features/user/user-types'

export function getAccessUserFullName(user: AccessUser): string {
  return `${user.nome} ${user.sobrenome}`.trim()
}

export function sortAccessUsers(users: AccessUser[]): AccessUser[] {
  return [...users].sort((a, b) =>
    getAccessUserFullName(a).localeCompare(getAccessUserFullName(b), 'pt-BR'),
  )
}

export function filterAccessUsersBySearch(
  users: AccessUser[],
  search: string,
): AccessUser[] {
  const normalizedSearch = search.trim().toLowerCase()

  if (!normalizedSearch) {
    return users
  }

  return users.filter((user) =>
    getAccessUserFullName(user).toLowerCase().includes(normalizedSearch),
  )
}

export function getAccessUserInitials(user: AccessUser): string {
  const first = user.nome.trim().charAt(0)
  const last = user.sobrenome.trim().charAt(0)
  return `${first}${last}`.toUpperCase()
}
