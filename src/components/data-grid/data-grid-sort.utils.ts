import type { SortingState } from '@tanstack/react-table'
import type { DataGridLayoutPreference } from '@/features/settings/user-preferences-types'
import { GRID_IDS, type GridId } from '@/components/data-grid/grid-registry'

const GRID_COLUMN_API_FIELD_MAP: Partial<Record<GridId, Record<string, string>>> = {
  [GRID_IDS.adminJobs]: {
    createdAt: 'created_at',
  },
  [GRID_IDS.adminScheduleExecutions]: {
    iniciadoEm: 'iniciado_em',
  },
  [GRID_IDS.auditLogs]: {
    criado_em: 'criado_em',
    action: 'action',
    category: 'category',
    outcome: 'outcome',
    actor_email: 'actor_email',
    resource_type: 'resource_type',
  },
  [GRID_IDS.myDashboards]: {
    nome: 'nome',
    dataCriacao: 'data_criacao',
    privacidade: 'privacidade',
    temporario: 'temporario',
  },
  [GRID_IDS.myReports]: {
    nome: 'nome',
    estado: 'estado',
    privacidade: 'privacidade',
  },
}

export function mapGridColumnToApiField(gridId: GridId, columnId: string): string {
  return GRID_COLUMN_API_FIELD_MAP[gridId]?.[columnId] ?? columnId
}

export function mapApiFieldToGridColumn(gridId: GridId, apiField: string): string {
  const forward = GRID_COLUMN_API_FIELD_MAP[gridId] ?? {}

  for (const [columnId, mappedApiField] of Object.entries(forward)) {
    if (mappedApiField === apiField) {
      return columnId
    }
  }

  return apiField
}

export function sortingStateFromApiSort(
  sort: string | undefined,
  gridId: GridId,
): SortingState {
  if (!sort) {
    return []
  }

  const [apiColumn, direction] = sort.split(':')
  if (!apiColumn) {
    return []
  }

  return [
    {
      id: mapApiFieldToGridColumn(gridId, apiColumn),
      desc: (direction ?? 'asc').toLowerCase() === 'desc',
    },
  ]
}

export function serializeSortingState(
  sorting: SortingState,
  gridId?: GridId,
): string | undefined {
  if (sorting.length === 0) {
    return undefined
  }

  const [primary] = sorting
  const column = gridId ? mapGridColumnToApiField(gridId, primary.id) : primary.id
  const direction = primary.desc ? 'desc' : 'asc'
  return `${column}:${direction}`
}

export function parseSortingState(sort: string | undefined): SortingState {
  if (!sort) {
    return []
  }

  const [column, direction] = sort.split(':')
  if (!column) {
    return []
  }

  return [{ id: column, desc: (direction ?? 'asc').toLowerCase() === 'desc' }]
}

export function sanitizeLayoutForColumns(
  layout: DataGridLayoutPreference | undefined,
  columnIds: string[],
): DataGridLayoutPreference {
  if (!layout) {
    return {}
  }

  const allowed = new Set(columnIds)
  const columnOrder = layout.columnOrder?.filter((id) => allowed.has(id))
  const columnSizing = Object.fromEntries(
    Object.entries(layout.columnSizing ?? {}).filter(([id]) => allowed.has(id)),
  )
  const sorting = layout.sorting?.filter((item) => allowed.has(item.id))

  return {
    ...(columnOrder && columnOrder.length > 0 ? { columnOrder } : {}),
    ...(Object.keys(columnSizing).length > 0 ? { columnSizing } : {}),
    ...(sorting && sorting.length > 0 ? { sorting } : {}),
  }
}

export function sortingStateFromLayout(
  layout: DataGridLayoutPreference | undefined,
): SortingState {
  return layout?.sorting?.map((item) => ({ id: item.id, desc: item.desc })) ?? []
}

export function layoutPatchFromTableState(input: {
  columnOrder: string[]
  columnSizing: Record<string, number>
  sorting: SortingState
}): DataGridLayoutPreference {
  return {
    columnOrder: input.columnOrder,
    columnSizing: input.columnSizing,
    sorting: input.sorting.map((item) => ({ id: item.id, desc: item.desc })),
  }
}
