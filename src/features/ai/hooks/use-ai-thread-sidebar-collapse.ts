import { useCallback, useState } from 'react'

const STORAGE_KEY = 'datadash:ai-chat-sidebar-collapsed'

function loadCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function saveCollapsed(collapsed: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, String(collapsed))
  } catch {
    // ignore quota / private mode
  }
}

export function useAiThreadSidebarCollapse() {
  const [collapsed, setCollapsed] = useState(loadCollapsed)

  const toggle = useCallback(() => {
    setCollapsed((current) => {
      const next = !current
      saveCollapsed(next)
      return next
    })
  }, [])

  return { collapsed, toggle }
}
