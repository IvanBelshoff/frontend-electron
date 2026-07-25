import { describe, expect, it } from 'vitest'
import {
  getSchemaColumnDraggableId,
  getSchemaTableDraggableId,
  isQueryEditorSqlDropTarget,
  parseSchemaColumnDraggableId,
  parseSchemaExplorerDragData,
  parseSchemaTableDraggableId,
  QUERY_EDITOR_SQL_DROP_ID,
  resolveDropPointer,
  toActiveDrag,
} from '@/features/query-editor/query-editor-dnd.utils'
import type { DragEndEvent } from '@dnd-kit/core'

describe('query-editor-dnd.utils', () => {
  it('builds and parses schema table draggable ids', () => {
    const id = getSchemaTableDraggableId('public', 'users')
    expect(parseSchemaTableDraggableId(id)).toEqual({
      type: 'schema-table',
      escopo: 'public',
      tabela: 'users',
      qualifiedName: 'public.users',
    })
  })

  it('builds and parses schema column draggable ids', () => {
    const id = getSchemaColumnDraggableId('public', 'users', 'id')
    expect(parseSchemaColumnDraggableId(id)).toEqual({
      type: 'schema-column',
      escopo: 'public',
      tabela: 'users',
      coluna: 'id',
    })
  })

  it('encodes special characters in draggable ids', () => {
    const id = getSchemaTableDraggableId('my:schema', 'user/table')
    expect(parseSchemaTableDraggableId(id)).toEqual({
      type: 'schema-table',
      escopo: 'my:schema',
      tabela: 'user/table',
      qualifiedName: 'my:schema.user/table',
    })
  })

  it('parses drag data payloads', () => {
    expect(
      parseSchemaExplorerDragData({
        type: 'schema-table',
        escopo: 'public',
        tabela: 'users',
        qualifiedName: 'public.users',
      }),
    ).toEqual({
      type: 'schema-table',
      escopo: 'public',
      tabela: 'users',
      qualifiedName: 'public.users',
    })

    expect(
      parseSchemaExplorerDragData({
        type: 'schema-column',
        escopo: 'public',
        tabela: 'users',
        coluna: 'id',
      }),
    ).toEqual({
      type: 'schema-column',
      escopo: 'public',
      tabela: 'users',
      coluna: 'id',
    })
  })

  it('maps drag data to active drag state', () => {
    expect(
      toActiveDrag({
        type: 'schema-table',
        escopo: 'public',
        tabela: 'users',
        qualifiedName: 'public.users',
      }),
    ).toEqual({
      kind: 'table',
      escopo: 'public',
      tabela: 'users',
      qualifiedName: 'public.users',
    })
  })

  it('identifies sql editor drop target', () => {
    expect(isQueryEditorSqlDropTarget(QUERY_EDITOR_SQL_DROP_ID)).toBe(true)
    expect(isQueryEditorSqlDropTarget('other')).toBe(false)
  })

  it('resolves drop pointer from mouse drag end event', () => {
    const event = {
      activatorEvent: { clientX: 100, clientY: 200 },
      delta: { x: 10, y: -5 },
    } as unknown as DragEndEvent

    expect(resolveDropPointer(event)).toEqual({ x: 110, y: 195 })
  })
})
