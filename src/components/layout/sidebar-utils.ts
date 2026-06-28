const SIDEBAR_EXPANDED_KEY = 'datadash.sidebar.expanded'

export function readSidebarExpanded(): boolean {
  if (typeof window === 'undefined') {
    return true
  }

  const stored = window.localStorage.getItem(SIDEBAR_EXPANDED_KEY)

  if (stored === null) {
    return true
  }

  return stored === 'true'
}

export function writeSidebarExpanded(expanded: boolean): void {
  window.localStorage.setItem(SIDEBAR_EXPANDED_KEY, String(expanded))
}
