export type NotificationTone = 'success' | 'error' | 'info' | 'warning'

export type NotificationDisplayStyle =
  | 'slideUpBar'
  | 'fadeTopRight'
  | 'scaleCenter'
  | 'slideFromLeft'
  | 'compactPill'
  | 'accentBorderCard'
  | 'stackShrink'
  | 'bounceIn'
  | 'flipIn'
  | 'blurMiniPanel'
  | 'topBanner'
  | 'circularProgress'
  | 'splitReveal'
  | 'minimalStrip'
  | 'timelineStack'

export type NotificationPhase = 'entering' | 'visible' | 'exiting'

export type NotificationPosition =
  | 'top-right'
  | 'top-center'
  | 'top-full'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'center'

export type NotificationPlacement =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'middle-center'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export type NotificationItem = {
  id: string
  tone: NotificationTone
  title: string
  description?: string
  displayStyle: NotificationDisplayStyle
  placement: NotificationPlacement
  durationMs: number
  dismissible: boolean
  createdAt: number
  phase: NotificationPhase
  paused: boolean
  progressKey: number
}

export type ShowNotificationInput = {
  tone: NotificationTone
  title: string
  description?: string
  displayStyle?: NotificationDisplayStyle
  placement?: NotificationPlacement
  durationMs?: number
  dismissible?: boolean
}

export type NotificationOptions = Omit<ShowNotificationInput, 'tone' | 'title'>
