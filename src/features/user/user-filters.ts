import type { ManagedUser } from './user-list-types'

export function applyUserFilters(users: ManagedUser[], search: string): ManagedUser[] {
  const normalizedSearch = search.trim().toLowerCase()

  if (!normalizedSearch) {
    return users
  }

  return users.filter((user) => {
    const fullName = `${user.nome} ${user.sobrenome}`.toLowerCase()

    if (fullName.includes(normalizedSearch)) {
      return true
    }

    if (user.email.toLowerCase().includes(normalizedSearch)) {
      return true
    }

    if (user.regras.some((regra) => regra.toLowerCase().includes(normalizedSearch))) {
      return true
    }

    if (user.permissoes.some((permissao) => permissao.toLowerCase().includes(normalizedSearch))) {
      return true
    }

    return false
  })
}
