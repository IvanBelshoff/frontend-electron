import { MarkerType, Position } from '@xyflow/react'
import type { Edge, Node } from '@xyflow/react'
import type { ManagedUser } from './user-list-types'

export type UserAccessFlowGraph = {
  nodes: Node[]
  edges: Edge[]
  canvasHeight: number
}

export function formatPermissionLabel(permissionName: string): string {
  return permissionName.replace(/^PERMISSAO_/i, '')
}

export function inferRoleFromPermission(
  permissionName: string,
  availableRules: string[],
): string | undefined {
  const normalizedPermission = permissionName.toUpperCase()

  if (normalizedPermission.includes('_DASHBOARD') && availableRules.includes('REGRA_DASHBOARD')) {
    return 'REGRA_DASHBOARD'
  }

  if (normalizedPermission.includes('_USUARIO') && availableRules.includes('REGRA_USUARIO')) {
    return 'REGRA_USUARIO'
  }

  if (availableRules.includes('REGRA_ADMIN')) {
    return 'REGRA_ADMIN'
  }

  return availableRules[0]
}

const NODE_MAX_WIDTH = 220
const NODE_MIN_WIDTH = 160
const LAYOUT_PADDING = 16
const COLUMN_GAP = 36

function resolveLayout(containerWidth: number) {
  const roleX = LAYOUT_PADDING

  if (containerWidth <= 0) {
    return { roleX, permissionX: 370 }
  }

  const permissionX = Math.max(
    roleX + NODE_MIN_WIDTH + COLUMN_GAP,
    containerWidth - NODE_MAX_WIDTH - LAYOUT_PADDING,
  )

  return { roleX, permissionX }
}

export function buildUserAccessFlowGraph(
  user: ManagedUser,
  containerWidth = 0,
): UserAccessFlowGraph {
  const { roleX, permissionX } = resolveLayout(containerWidth)
  const roleNames = Array.from(new Set(user.regras))

  const normalizedPermissionLinks = (() => {
    if (user.permissoesDetalhadas.length > 0) {
      return user.permissoesDetalhadas
    }

    return user.permissoes.map((permissionName) => ({
      nome: permissionName,
      regraNome: inferRoleFromPermission(permissionName, roleNames),
    }))
  })()

  const groupedPermissions = new Map<string, Set<string>>()

  const effectiveRoleNames = roleNames.length > 0 ? roleNames : ['SEM_REGRA']
  effectiveRoleNames.forEach((roleName) => {
    groupedPermissions.set(roleName, new Set())
  })

  normalizedPermissionLinks.forEach((permissionLink) => {
    const resolvedRoleName =
      permissionLink.regraNome && groupedPermissions.has(permissionLink.regraNome)
        ? permissionLink.regraNome
        : inferRoleFromPermission(permissionLink.nome, effectiveRoleNames)

    const fallbackRole =
      resolvedRoleName && groupedPermissions.has(resolvedRoleName)
        ? resolvedRoleName
        : effectiveRoleNames[0]

    groupedPermissions.get(fallbackRole)?.add(permissionLink.nome)
  })

  const nodes: Node[] = []
  const edges: Edge[] = []

  const rowGap = 56
  const blockGap = 16
  let currentY = 0

  effectiveRoleNames.forEach((roleName, roleIndex) => {
    const permissions = Array.from(groupedPermissions.get(roleName) || [])
    const blockRows = Math.max(permissions.length, 1)
    const blockHeight = blockRows * rowGap
    const roleY = currentY + (blockHeight - rowGap) / 2
    const roleNodeId = `role-${roleIndex}-${roleName}`

    nodes.push({
      id: roleNodeId,
      data: { label: roleName },
      type: 'default',
      position: { x: roleX, y: roleY },
      sourcePosition: Position.Right,
      className: `user-access-node user-access-node-role ${roleName === 'REGRA_ADMIN' ? 'user-access-node-role-admin' : ''} ${permissions.length === 0 ? 'user-access-node-role-no-permissions' : ''}`,
      draggable: false,
      selectable: false,
    })

    permissions.forEach((permissionName, permissionIndex) => {
      const permissionNodeId = `permission-${roleIndex}-${permissionIndex}-${permissionName}`
      const permissionY = currentY + permissionIndex * rowGap

      nodes.push({
        id: permissionNodeId,
        data: { label: formatPermissionLabel(permissionName) },
        type: 'default',
        position: { x: permissionX, y: permissionY },
        targetPosition: Position.Left,
        className: 'user-access-node user-access-node-permission',
        draggable: false,
        selectable: false,
      })

      edges.push({
        id: `edge-${roleNodeId}-${permissionNodeId}`,
        source: roleNodeId,
        target: permissionNodeId,
        animated: true,
        className: 'user-access-edge',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 16,
          color: '#f59e0b',
        },
        style: {
          stroke: '#f59e0b',
          strokeWidth: 1.8,
          strokeDasharray: '6 5',
        },
      })
    })

    currentY += blockHeight + blockGap
  })

  const maxNodeY = nodes.length > 0 ? Math.max(...nodes.map((node) => node.position.y)) : 0
  const canvasHeight = Math.max(180, maxNodeY + 72)

  return { nodes, edges, canvasHeight }
}
