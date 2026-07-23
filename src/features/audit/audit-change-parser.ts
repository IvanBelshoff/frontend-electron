import type { AuditFieldChange, AuditMetadataV2 } from '@/features/audit/audit-types'

function isAuditFieldChange(value: unknown): value is AuditFieldChange {
  if (!value || typeof value !== 'object') {
    return false
  }

  const record = value as Record<string, unknown>
  return typeof record.field === 'string' && 'from' in record && 'to' in record
}

export function getAuditChanges(metadata: Record<string, unknown>): AuditFieldChange[] {
  const changes = metadata.changes
  if (!Array.isArray(changes)) {
    return []
  }

  return changes.filter(isAuditFieldChange)
}

export function getAuditContext(
  metadata: Record<string, unknown>,
): Record<string, unknown> | null {
  const context = metadata.context
  if (context && typeof context === 'object' && !Array.isArray(context)) {
    return context as Record<string, unknown>
  }

  return null
}

export function hasLegacyMetadata(metadata: Record<string, unknown>): boolean {
  const changes = getAuditChanges(metadata)
  if (changes.length > 0) {
    return false
  }

  const context = getAuditContext(metadata)
  const contextKeys = context ? Object.keys(context) : []
  const rootKeys = Object.keys(metadata).filter(
    (key) => key !== 'changes' && key !== 'context',
  )

  return contextKeys.length > 0 || rootKeys.length > 0
}

export function getLegacyMetadataDisplay(
  metadata: Record<string, unknown>,
): Record<string, unknown> {
  const context = getAuditContext(metadata)
  if (context && Object.keys(context).length > 0) {
    return context
  }

  const { changes: _changes, context: _context, ...legacy } = metadata
  return legacy
}

export function parseAuditMetadata(metadata: Record<string, unknown>): AuditMetadataV2 {
  return {
    changes: getAuditChanges(metadata),
    context: getAuditContext(metadata) ?? undefined,
  }
}
