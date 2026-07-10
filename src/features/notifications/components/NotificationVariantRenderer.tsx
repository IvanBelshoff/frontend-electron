import NotificationToast from '@/features/notifications/components/NotificationToast'
import type { NotificationItem } from '@/features/notifications/notification-types'

type NotificationVariantRendererProps = {
  item: NotificationItem
  stackIndex: number
}

export default function NotificationVariantRenderer({
  item,
  stackIndex,
}: NotificationVariantRendererProps) {
  switch (item.displayStyle) {
    case 'slideUpBar':
    case 'fadeTopRight':
    case 'scaleCenter':
    case 'slideFromLeft':
    case 'compactPill':
    case 'accentBorderCard':
    case 'stackShrink':
    case 'bounceIn':
    case 'flipIn':
    case 'blurMiniPanel':
    case 'topBanner':
    case 'circularProgress':
    case 'splitReveal':
    case 'minimalStrip':
    case 'timelineStack':
    default:
      return <NotificationToast item={item} stackIndex={stackIndex} />
  }
}
