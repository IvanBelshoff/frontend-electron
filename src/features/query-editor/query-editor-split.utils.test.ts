import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { QUERY_EDITOR_LAYOUT_STORAGE_KEY } from '@/features/query-editor/query-editor-layout.constants'
import {
  clampEditorRatio,
  computeSplitPaneHeights,
  loadPersistedQueryEditorLayout,
  ratioFromEditorHeight,
  savePersistedQueryEditorLayout,
  toggleFocusPane,
  isDefaultEditorRatio,
} from '@/features/query-editor/query-editor-split.utils'

describe('query-editor-split.utils', () => {
  describe('clampEditorRatio', () => {
    it('clamps ratio between min editor and min results heights', () => {
      const totalHeight = 500
      expect(clampEditorRatio(0.05, totalHeight)).toBeGreaterThan(0.05)
      expect(clampEditorRatio(0.95, totalHeight)).toBeLessThan(0.95)
      expect(clampEditorRatio(0.5, totalHeight)).toBeCloseTo(0.5, 2)
    })
  })

  describe('computeSplitPaneHeights', () => {
    it('allocates full height to editor when focused', () => {
      const result = computeSplitPaneHeights({
        totalHeight: 600,
        editorRatio: 0.4,
        focusPane: 'editor',
      })

      expect(result).toEqual({
        editorHeight: 600,
        resultsHeight: 0,
        showHandle: false,
      })
    })

    it('allocates full height to results when focused', () => {
      const result = computeSplitPaneHeights({
        totalHeight: 600,
        editorRatio: 0.4,
        focusPane: 'results',
      })

      expect(result).toEqual({
        editorHeight: 0,
        resultsHeight: 600,
        showHandle: false,
      })
    })

    it('splits height with handle when not focused', () => {
      const result = computeSplitPaneHeights({
        totalHeight: 600,
        editorRatio: 0.5,
        focusPane: 'none',
      })

      expect(result.showHandle).toBe(true)
      expect(result.editorHeight + result.resultsHeight + 6).toBe(600)
      expect(result.editorHeight).toBeGreaterThanOrEqual(140)
      expect(result.resultsHeight).toBeGreaterThanOrEqual(160)
    })
  })

  describe('ratioFromEditorHeight', () => {
    it('derives ratio from dragged editor height', () => {
      const ratio = ratioFromEditorHeight(250, 600)
      const heights = computeSplitPaneHeights({
        totalHeight: 600,
        editorRatio: ratio,
        focusPane: 'none',
      })

      expect(heights.editorHeight).toBe(250)
    })
  })

  describe('toggleFocusPane', () => {
    it('toggles focus on and off for the same pane', () => {
      expect(toggleFocusPane('none', 'editor')).toBe('editor')
      expect(toggleFocusPane('editor', 'editor')).toBe('none')
      expect(toggleFocusPane('results', 'editor')).toBe('editor')
    })
  })

  describe('isDefaultEditorRatio', () => {
    it('detects when ratio is at default', () => {
      expect(isDefaultEditorRatio(0.5)).toBe(true)
      expect(isDefaultEditorRatio(0.48)).toBe(false)
    })
  })

  describe('layout persistence', () => {
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

    it('loads defaults when storage is empty', () => {
      expect(loadPersistedQueryEditorLayout()).toEqual({
        schemaCollapsed: false,
        editorRatio: 0.5,
      })
    })

    it('persists and restores layout state', () => {
      savePersistedQueryEditorLayout({ schemaCollapsed: true, editorRatio: 0.55 })

      expect(storage.get(QUERY_EDITOR_LAYOUT_STORAGE_KEY)).toBeTruthy()
      expect(loadPersistedQueryEditorLayout()).toEqual({
        schemaCollapsed: true,
        editorRatio: 0.55,
      })
    })

    it('falls back to defaults for invalid persisted ratio', () => {
      storage.set(
        QUERY_EDITOR_LAYOUT_STORAGE_KEY,
        JSON.stringify({ schemaCollapsed: false, editorRatio: 2 }),
      )

      expect(loadPersistedQueryEditorLayout().editorRatio).toBe(0.5)
    })
  })
})
