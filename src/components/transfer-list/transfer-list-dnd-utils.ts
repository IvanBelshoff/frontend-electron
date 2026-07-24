import type { TransferListSide } from '@/components/transfer-list/types'

export type TransferListActiveDrag = {
  itemId: number
  side: TransferListSide
}

export function getTransferListDraggableId(side: TransferListSide, itemId: number) {
  return `transfer-item:${side}:${itemId}`
}

export function parseTransferListDraggableId(
  id: string | number,
): TransferListActiveDrag | null {
  const value = String(id)
  const match = /^transfer-item:(available|granted):(\d+)$/.exec(value)

  if (!match) {
    return null
  }

  return {
    side: match[1] as TransferListSide,
    itemId: Number(match[2]),
  }
}

export function isTransferListDropSide(id: string | number): id is TransferListSide {
  return id === 'available' || id === 'granted'
}
