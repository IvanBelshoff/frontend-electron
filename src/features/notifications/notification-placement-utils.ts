import type { NotificationPlacement } from './notification-types'

export const NOTIFICATION_PLACEMENTS: NotificationPlacement[] = [
  'top-left',
  'top-center',
  'top-right',
  'middle-left',
  'middle-center',
  'middle-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
]

export const NOTIFICATION_PLACEMENT_LABELS: Record<NotificationPlacement, string> = {
  'top-left': 'Superior esquerdo',
  'top-center': 'Superior centro',
  'top-right': 'Superior direito',
  'middle-left': 'Centro esquerdo',
  'middle-center': 'Centro',
  'middle-right': 'Centro direito',
  'bottom-left': 'Inferior esquerdo',
  'bottom-center': 'Inferior centro',
  'bottom-right': 'Inferior direito',
}

export const NOTIFICATION_PLACEMENT_SHORT_LABELS: Record<NotificationPlacement, string> = {
  'top-left': 'Sup. esq.',
  'top-center': 'Sup. centro',
  'top-right': 'Sup. dir.',
  'middle-left': 'C. esq.',
  'middle-center': 'Centro',
  'middle-right': 'C. dir.',
  'bottom-left': 'Inf. esq.',
  'bottom-center': 'Inf. centro',
  'bottom-right': 'Inf. dir.',
}

export const NOTIFICATION_PLACEMENT_CLASSES: Record<NotificationPlacement, string> = {
  'top-left': 'top-4 left-4 items-start',
  'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
  'top-right': 'top-4 right-4 items-end',
  'middle-left': 'top-1/2 left-4 -translate-y-1/2 items-start',
  'middle-center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center',
  'middle-right': 'top-1/2 right-4 -translate-y-1/2 items-end',
  'bottom-left': 'bottom-4 left-4 items-start',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
  'bottom-right': 'bottom-4 right-4 items-end',
}

export function getNotificationPlacementLabel(placement: NotificationPlacement): string {
  return NOTIFICATION_PLACEMENT_LABELS[placement]
}
