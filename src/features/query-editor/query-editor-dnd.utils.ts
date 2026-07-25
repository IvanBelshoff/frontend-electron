import type { DragEndEvent } from '@dnd-kit/core'

export const QUERY_EDITOR_SQL_DROP_ID = 'query-editor-sql-drop'

const SCHEMA_TABLE_PREFIX = 'schema-table:'
const SCHEMA_COLUMN_PREFIX = 'schema-column:'

export type SchemaTableDragData = {
  type: 'schema-table'
  escopo: string
  tabela: string
  qualifiedName: string
}

export type SchemaColumnDragData = {
  type: 'schema-column'
  escopo: string
  tabela: string
  coluna: string
}

export type SchemaExplorerDragData = SchemaTableDragData | SchemaColumnDragData

export type SchemaExplorerActiveDrag =
  | {
      kind: 'table'
      escopo: string
      tabela: string
      qualifiedName: string
    }
  | {
      kind: 'column'
      escopo: string
      tabela: string
      coluna: string
    }

function encodeSegment(value: string): string {
  return encodeURIComponent(value)
}

function decodeSegment(value: string): string {
  return decodeURIComponent(value)
}

export function getSchemaTableDraggableId(escopo: string, tabela: string): string {
  return `${SCHEMA_TABLE_PREFIX}${encodeSegment(escopo)}:${encodeSegment(tabela)}`
}

export function getSchemaColumnDraggableId(
  escopo: string,
  tabela: string,
  coluna: string,
): string {
  return `${SCHEMA_COLUMN_PREFIX}${encodeSegment(escopo)}:${encodeSegment(tabela)}:${encodeSegment(coluna)}`
}

export function parseSchemaTableDraggableId(id: string | number): SchemaTableDragData | null {
  const value = String(id)
  const match = new RegExp(`^${SCHEMA_TABLE_PREFIX}([^:]+):(.+)$`).exec(value)

  if (!match) {
    return null
  }

  const escopo = decodeSegment(match[1])
  const tabela = decodeSegment(match[2])

  return {
    type: 'schema-table',
    escopo,
    tabela,
    qualifiedName: `${escopo}.${tabela}`,
  }
}

export function parseSchemaColumnDraggableId(id: string | number): SchemaColumnDragData | null {
  const value = String(id)
  const match = new RegExp(`^${SCHEMA_COLUMN_PREFIX}([^:]+):([^:]+):(.+)$`).exec(value)

  if (!match) {
    return null
  }

  return {
    type: 'schema-column',
    escopo: decodeSegment(match[1]),
    tabela: decodeSegment(match[2]),
    coluna: decodeSegment(match[3]),
  }
}

export function parseSchemaExplorerDragData(
  data: unknown,
): SchemaExplorerDragData | null {
  if (!data || typeof data !== 'object') {
    return null
  }

  const record = data as Record<string, unknown>

  if (record.type === 'schema-table') {
    const escopo = String(record.escopo ?? '')
    const tabela = String(record.tabela ?? '')
    const qualifiedName = String(record.qualifiedName ?? `${escopo}.${tabela}`)

    if (!escopo || !tabela) {
      return null
    }

    return { type: 'schema-table', escopo, tabela, qualifiedName }
  }

  if (record.type === 'schema-column') {
    const escopo = String(record.escopo ?? '')
    const tabela = String(record.tabela ?? '')
    const coluna = String(record.coluna ?? '')

    if (!escopo || !tabela || !coluna) {
      return null
    }

    return { type: 'schema-column', escopo, tabela, coluna }
  }

  return null
}

export function toActiveDrag(data: SchemaExplorerDragData): SchemaExplorerActiveDrag {
  if (data.type === 'schema-table') {
    return {
      kind: 'table',
      escopo: data.escopo,
      tabela: data.tabela,
      qualifiedName: data.qualifiedName,
    }
  }

  return {
    kind: 'column',
    escopo: data.escopo,
    tabela: data.tabela,
    coluna: data.coluna,
  }
}

export function resolveDropPointer(event: DragEndEvent): { x: number; y: number } | null {
  const activator = event.activatorEvent

  if (activator && 'clientX' in activator && 'clientY' in activator) {
    const pointer = activator as { clientX: number; clientY: number }
    return {
      x: pointer.clientX + event.delta.x,
      y: pointer.clientY + event.delta.y,
    }
  }

  if (activator instanceof TouchEvent && activator.changedTouches.length > 0) {
    const touch = activator.changedTouches[0]
    return {
      x: touch.clientX + event.delta.x,
      y: touch.clientY + event.delta.y,
    }
  }

  return null
}

export function isQueryEditorSqlDropTarget(id: string | number | undefined): boolean {
  return id === QUERY_EDITOR_SQL_DROP_ID
}
