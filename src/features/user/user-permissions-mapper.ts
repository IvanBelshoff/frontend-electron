import type { ManagedUser } from '@/features/user/user-list-types'
import type {
  RoleCatalogApiRecord,
  UserPermissionOption,
  UserPermissionsSelection,
  UserRuleOption,
} from '@/features/user/user-permissions-types'

const ADMIN_RULE_MARKER = 'ADMIN'
const PENDING_PERMISSION_ID_START = -1_000

const RULE_DISPLAY_ORDER: Record<string, number> = {
  REGRA_ADMIN: 0,
  REGRA_IA: 1,
}

function getRuleDisplayOrder(ruleName: string): number {
  const normalizedRuleName = ruleName.toUpperCase()

  if (normalizedRuleName in RULE_DISPLAY_ORDER) {
    return RULE_DISPLAY_ORDER[normalizedRuleName]
  }

  if (normalizedRuleName.includes('ADMIN')) {
    return RULE_DISPLAY_ORDER.REGRA_ADMIN
  }

  if (normalizedRuleName.includes('_IA') || normalizedRuleName.endsWith('IA')) {
    return RULE_DISPLAY_ORDER.REGRA_IA
  }

  return 100
}

export function sortRoleCatalogByDisplayOrder(rules: UserRuleOption[]): UserRuleOption[] {
  return [...rules].sort((left, right) => {
    const orderDiff = getRuleDisplayOrder(left.nome) - getRuleDisplayOrder(right.nome)

    if (orderDiff !== 0) {
      return orderDiff
    }

    return left.nome.localeCompare(right.nome, 'pt-BR')
  })
}

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

  const dedupedById = new Map<number, UserRuleOption>()

  normalizedRules.forEach((rule) => {
    dedupedById.set(rule.id, rule)
  })

  return sortRoleCatalogByDisplayOrder(Array.from(dedupedById.values()))
}

export function isPendingPermission(permission: UserPermissionOption): boolean {
  return Boolean(permission.pendingSync) || permission.id < 0
}

export function mergeRoleCatalogWithEnvDefinitions(
  apiCatalog: UserRuleOption[],
  envDefinitions: Record<string, string[]>,
): UserRuleOption[] {
  if (Object.keys(envDefinitions).length === 0) {
    return apiCatalog
  }

  const permissionsByName = new Map<string, UserPermissionOption>()

  apiCatalog.forEach((rule) => {
    rule.permissoes.forEach((permission) => {
      permissionsByName.set(permission.nome, permission)
    })
  })

  const apiRulesByName = new Map(apiCatalog.map((rule) => [rule.nome, rule]))
  const mergedRules: UserRuleOption[] = []
  const processedRuleNames = new Set<string>()

  for (const [ruleName, envPermissionNames] of Object.entries(envDefinitions)) {
    const apiRule = apiRulesByName.get(ruleName)

    if (!apiRule) {
      continue
    }

    processedRuleNames.add(ruleName)

    const mergedPermissions: UserPermissionOption[] = []
    const seenNames = new Set<string>()
    let pendingCounter = 0

    for (const permissionName of envPermissionNames) {
      if (seenNames.has(permissionName)) {
        continue
      }

      const fromApi =
        apiRule.permissoes.find((permission) => permission.nome === permissionName) ??
        permissionsByName.get(permissionName)

      if (fromApi) {
        mergedPermissions.push({
          ...fromApi,
          regraId: apiRule.id,
          regraNome: apiRule.nome,
        })
      } else {
        pendingCounter += 1
        mergedPermissions.push({
          id: PENDING_PERMISSION_ID_START - pendingCounter,
          nome: permissionName,
          regraId: apiRule.id,
          regraNome: apiRule.nome,
          pendingSync: true,
        })
      }

      seenNames.add(permissionName)
    }

    for (const permission of apiRule.permissoes) {
      if (!seenNames.has(permission.nome)) {
        mergedPermissions.push(permission)
        seenNames.add(permission.nome)
      }
    }

    mergedRules.push({
      ...apiRule,
      permissoes: mergedPermissions.sort((left, right) =>
        left.nome.localeCompare(right.nome, 'pt-BR'),
      ),
    })
  }

  for (const apiRule of apiCatalog) {
    if (!processedRuleNames.has(apiRule.nome)) {
      mergedRules.push(apiRule)
    }
  }

  return sortRoleCatalogByDisplayOrder(mergedRules)
}

export function buildPermissionSelectionFromUser(  user: ManagedUser,
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

  if (normalizedRuleName.includes('_IA') || normalizedRuleName.endsWith('IA')) {
    return 'Permite usar o assistente de IA do DataDash.'
  }

  return rule.nome
}

export function describePermissionAccess(permission: UserPermissionOption): string {
  if (permission.descricao) {
    return permission.descricao
  }

  return permission.nome.replace(/_/g, ' ')
}
