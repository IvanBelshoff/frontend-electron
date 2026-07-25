import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import {
  QUERY_EDITOR_DEFAULT_FETCH_LIMIT,
  QUERY_EDITOR_FETCH_LIMIT_STORAGE_KEY,
  QUERY_EDITOR_MAX_FETCH_LIMIT,
} from '@/features/query-editor/query-editor-fetch.constants'
import {
  clampFetchLimit,
  exceedsRecommendedFetchLimit,
  loadPersistedFetchLimit,
  parseFetchLimitInput,
  savePersistedFetchLimit,
} from '@/features/query-editor/query-editor-fetch.utils'

describe('query-editor-fetch.utils', () => {
  describe('clampFetchLimit', () => {
    it('defaults invalid values to 200', () => {
      expect(clampFetchLimit(Number.NaN)).toBe(QUERY_EDITOR_DEFAULT_FETCH_LIMIT)
    })

    it('clamps to max fetch limit', () => {
      expect(clampFetchLimit(50000)).toBe(QUERY_EDITOR_MAX_FETCH_LIMIT)
    })

    it('enforces minimum of 1', () => {
      expect(clampFetchLimit(0)).toBe(1)
    })
  })

  describe('parseFetchLimitInput', () => {
    it('parses numeric input', () => {
      expect(parseFetchLimitInput('500')).toBe(500)
    })

    it('falls back to default for empty input', () => {
      expect(parseFetchLimitInput('')).toBe(QUERY_EDITOR_DEFAULT_FETCH_LIMIT)
    })
  })

  describe('exceedsRecommendedFetchLimit', () => {
    it('returns true above 200', () => {
      expect(exceedsRecommendedFetchLimit(201)).toBe(true)
    })

    it('returns false at 200', () => {
      expect(exceedsRecommendedFetchLimit(200)).toBe(false)
    })
  })

  describe('persistence', () => {
    const storage = new Map<string, string>()

    beforeEach(() => {
      storage.clear()
      vi.stubGlobal('sessionStorage', {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          storage.set(key, value)
        },
        removeItem: (key: string) => {
          storage.delete(key)
        },
        clear: () => {
          storage.clear()
        },
      })
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('loads default when storage is empty', () => {
      expect(loadPersistedFetchLimit()).toBe(QUERY_EDITOR_DEFAULT_FETCH_LIMIT)
    })

    it('persists and restores fetch limit', () => {
      savePersistedFetchLimit(350)
      expect(storage.get(QUERY_EDITOR_FETCH_LIMIT_STORAGE_KEY)).toBe('350')
      expect(loadPersistedFetchLimit()).toBe(350)
    })
  })
})
