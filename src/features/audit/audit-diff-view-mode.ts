export type AuditDiffViewMode = 'dev' | 'simple'

const STORAGE_KEY = 'datadash.audit.diffViewMode'

export function readStoredAuditDiffViewMode(): AuditDiffViewMode {
  if (typeof window === 'undefined') {
    return 'dev'
  }

  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'simple' ? 'simple' : 'dev'
}

export function storeAuditDiffViewMode(mode: AuditDiffViewMode): void {
  window.localStorage.setItem(STORAGE_KEY, mode)
}
