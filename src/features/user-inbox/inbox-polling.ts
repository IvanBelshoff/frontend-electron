let boostUntil = 0

export function boostInboxPolling(durationMs = 120_000): void {
  boostUntil = Date.now() + durationMs
}

export function isInboxPollingBoosted(): boolean {
  return Date.now() < boostUntil
}

export function resolveInboxPollInterval(options: {
  isWindowVisible: boolean
  isNotificationsTabOpen: boolean
  unreadCount: number
}): number | false {
  if (!options.isWindowVisible) {
    return false
  }

  if (options.isNotificationsTabOpen || isInboxPollingBoosted()) {
    return 5_000
  }

  if (options.unreadCount > 0) {
    return 15_000
  }

  return 60_000
}
