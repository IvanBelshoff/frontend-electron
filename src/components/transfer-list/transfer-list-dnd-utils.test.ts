import { describe, expect, it } from 'vitest'
import {
  getTransferListDraggableId,
  isTransferListDropSide,
  parseTransferListDraggableId,
} from '@/components/transfer-list/transfer-list-dnd-utils'

describe('transfer-list-dnd-utils', () => {
  it('builds and parses draggable ids', () => {
    const id = getTransferListDraggableId('available', 42)

    expect(id).toBe('transfer-item:available:42')
    expect(parseTransferListDraggableId(id)).toEqual({
      side: 'available',
      itemId: 42,
    })
  })

  it('returns null for invalid draggable ids', () => {
    expect(parseTransferListDraggableId('invalid')).toBeNull()
    expect(parseTransferListDraggableId('transfer-item:other:1')).toBeNull()
  })

  it('detects drop sides', () => {
    expect(isTransferListDropSide('available')).toBe(true)
    expect(isTransferListDropSide('granted')).toBe(true)
    expect(isTransferListDropSide('transfer-item:available:1')).toBe(false)
  })
})
