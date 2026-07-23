import { describe, expect, it } from 'vitest'
import {
  getAuditChanges,
  getLegacyMetadataDisplay,
  hasLegacyMetadata,
} from '@/features/audit/audit-change-parser'

describe('audit-change-parser', () => {
  it('extracts changes array from metadata', () => {
    const metadata = {
      changes: [{ field: 'nome', from: 'A', to: 'B' }],
    }

    expect(getAuditChanges(metadata)).toEqual(metadata.changes)
  })

  it('detects legacy metadata without changes', () => {
    expect(hasLegacyMetadata({ nome: 'Dashboard Seed 05' })).toBe(true)
    expect(hasLegacyMetadata({ changes: [{ field: 'nome', from: 'A', to: 'B' }] })).toBe(
      false,
    )
  })

  it('returns context as legacy display when present', () => {
    expect(
      getLegacyMetadataDisplay({
        changes: [],
        context: { parametros: { id: 1 } },
      }),
    ).toEqual({ parametros: { id: 1 } })
  })
})
