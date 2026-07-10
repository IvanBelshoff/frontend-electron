import { getNotificationPlacement, getNotificationStyle } from './notification-preferences'
import { notificationStore } from './notification-store'
import type {
  NotificationDisplayStyle,
  NotificationOptions,
  NotificationTone,
  ShowNotificationInput,
} from './notification-types'

function show(input: ShowNotificationInput): string {
  return notificationStore.add(input)
}

function withDefaults(
  tone: NotificationTone,
  title: string,
  options?: NotificationOptions,
): ShowNotificationInput {
  return {
    tone,
    title,
    description: options?.description,
    displayStyle: options?.displayStyle ?? getNotificationStyle(),
    placement: options?.placement ?? getNotificationPlacement(),
    durationMs: options?.durationMs,
    dismissible: options?.dismissible,
  }
}

export const notify = {
  show,

  success(title: string, options?: NotificationOptions) {
    return show(withDefaults('success', title, options))
  },

  error(title: string, options?: NotificationOptions) {
    return show(withDefaults('error', title, options))
  },

  info(title: string, options?: NotificationOptions) {
    return show(withDefaults('info', title, options))
  },

  warning(title: string, options?: NotificationOptions) {
    return show(withDefaults('warning', title, options))
  },

  dismiss(id: string) {
    notificationStore.dismiss(id)
  },

  clear() {
    notificationStore.clear()
  },

  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
      description?: string
      displayStyle?: NotificationDisplayStyle
    },
  ): Promise<T> {
    const id = show({
      tone: 'info',
      title: messages.loading,
      description: messages.description,
      displayStyle: messages.displayStyle ?? getNotificationStyle(),
      durationMs: 60000,
      dismissible: false,
    })

    return promise
      .then((result) => {
        notificationStore.remove(id)
        notify.success(messages.success, {
          description: messages.description,
          displayStyle: messages.displayStyle,
        })
        return result
      })
      .catch((error: unknown) => {
        notificationStore.remove(id)
        const message = error instanceof Error ? error.message : messages.error
        notify.error(message, {
          description: messages.description,
          displayStyle: messages.displayStyle,
        })
        throw error
      })
  },
}
