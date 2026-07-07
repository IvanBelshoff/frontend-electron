import type { ManagedUser } from '@/features/user/user-list-types'
import type {
  RoleCatalogApiRecord,
  UserPermissionOption,
  UserPermissionsSelection,
  UserRuleOption,
} from '@/features/user/user-permissions-types'

const ADMIN_RULE_MARKER = 'ADMIN'

export function isAdminRuleName(ruleName: string): boolean {
  return ruleName.toUpperCase().includes(ADMIN_RULE_MARKER)
}

export function normalizeRoleCatalog(payload: unknown): UserRuleOption[] {
  if (!Array.isArray(payload)) {
    return []
  }

  const normalizedRules = payload
    .map((rawItem) => {
      if (!rawItem || typeof rawItem !== 'object') {
        return null
      }

      const item = rawItem as RoleCatalogApiRecord
      const id = Number(item.id)
      const nome = typeof item.nome === 'string' ? item.nome.trim() : ''
      const descricao =
        typeof item.descricao === 'string' && item.descricao.trim().length > 0
          ? item.descricao.trim()
          : undefined

      if (!Number.isFinite(id) || nome.length === 0) {
        return null
      }

      const rawPermissions = Array.isArray(item.permissao) ? item.permissao : []

      const permissoes = rawPermissions
        .map((rawPermission) => {
          if (!rawPermission || typeof rawPermission !== 'object') {
            return null
          }

          const permissionId = Number(rawPermission.id)
          const permissionName =
            typeof rawPermission.nome === 'string' ? rawPermission.nome.trim() : ''
          const permissionDescription =
            typeof rawPermission.descricao === 'string' &&
            rawPermission.descricao.trim().length > 0
              ? rawPermission.descricao.trim()
              : undefined

          if (!Number.isFinite(permissionId) || permissionName.length === 0) {
            return null
          }

          const permission: UserPermissionOption = {
            id: permissionId,
            nome: permissionName,
            regraId: id,
            regraNome: nome,
            ...(permissionDescription ? { descricao: permissionDescription } : {}),
          }

          return permission
        })
        .filter((permission): permission is UserPermissionOption => permission !== null)
        .sort((left, right) => left.nome.localeCompare(right.nome, 'pt-BR'))

      const rule: UserRuleOption = {
        id,
        nome,
        permissoes,
        ...(descricao ? { descricao } : {}),
      }

      return rule
    })
    .filter((rule): rule is UserRuleOption => rule !== null)
    .sort((left, right) => left.nome.localeCompare(right.nome, 'pt-BR'))

  const dedupedById = new Map<number, UserRuleOption>()

  normalizedRules.forEach((rule) => {
    dedupedById.set(rule.id, rule)
  })

  return Array.from(dedupedById.values())
}

export function buildPermissionSelectionFromUser(
  user: ManagedUser,
  catalog: UserRuleOption[],
): UserPermissionsSelection {
  const roleNameSet = new Set(user.regras)
  const selectedRuleIds = catalog
    .filter((rule) => roleNameSet.has(rule.nome))
    .map((rule) => rule.id)

  const permissionIdsByName = new Map<string, number[]>()
  const permissionIdsByRuleAndName = new Map<string, number>()

  catalog.forEach((rule) => {
    rule.permissoes.forEach((permission) => {
      const byName = permissionIdsByName.get(permission.nome) || []
      byName.push(permission.id)
      permissionIdsByName.set(permission.nome, byName)
      permissionIdsByRuleAndName.set(`${rule.nome}::${permission.nome}`, permission.id)
    })
  })

  const selectedPermissionIds = new Set<number>()
  const detailedPermissions = user.permissoesDetalhadas

  if (detailedPermissions.length > 0) {
    detailedPermissions.forEach((permissionLink) => {
      const byRuleAndName = permissionLink.regraNome
        ? permissionIdsByRuleAndName.get(`${permissionLink.regraNome}::${permissionLink.nome}`)
        : undefined

      if (typeof byRuleAndName === 'number') {
        selectedPermissionIds.add(byRuleAndName)
        return
      }

      const byName = permissionIdsByName.get(permissionLink.nome)

      if (byName && byName.length > 0) {
        selectedPermissionIds.add(byName[0])
      }
    })
  } else {
    user.permissoes.forEach((permissionName) => {
      const byName = permissionIdsByName.get(permissionName)

      if (byName && byName.length > 0) {
        selectedPermissionIds.add(byName[0])
      }
    })
  }

  return {
    ruleIds: Array.from(new Set(selectedRuleIds)).sort((left, right) => left - right),
    permissionIds: Array.from(selectedPermissionIds).sort((left, right) => left - right),
  }
}

export function areSameIdCollections(left: number[], right: number[]): boolean {
  const leftUnique = Array.from(new Set(left)).sort((leftValue, rightValue) => leftValue - rightValue)
  const rightUnique = Array.from(new Set(right)).sort((leftValue, rightValue) => leftValue - rightValue)

  if (leftUnique.length !== rightUnique.length) {
    return false
  }

  return leftUnique.every((value, index) => value === rightUnique[index])
}

export function findAdminRuleIds(catalog: UserRuleOption[]): number[] {
  return catalog.filter((rule) => isAdminRuleName(rule.nome)).map((rule) => rule.id)
}

export function findAdminRuleId(catalog: UserRuleOption[]): number | undefined {
  return findAdminRuleIds(catalog)[0]
}

export function sortIds(ids: number[]): number[] {
  return Array.from(new Set(ids)).sort((left, right) => left - right)
}

export function describeRoleAccess(rule: UserRuleOption): string {
  if (rule.descricao) {
    return rule.descricao
  }

  const normalizedRuleName = rule.nome.toUpperCase()

  if (normalizedRuleName.includes('ADMIN')) {
    return 'Acesso administrativo completo ao sistema.'
  }

  if (normalizedRuleName.includes('DASHBOARD')) {
    return 'Permite gerenciar dashboards e recursos relacionados.'
  }

  if (normalizedRuleName.includes('USUARIO')) {
    return 'Permite gerenciar usuários e recursos relacionados.'
  }

  return rule.nome
}

export function describePermissionAccess(permission: UserPermissionOption): string {
  if (permission.descricao) {
    return permission.descricao
  }

  return permission.nome.replace(/_/g, ' ')
}
