import {
  QUERY_EDITOR_DEFAULT_FETCH_LIMIT,
  QUERY_EDITOR_FETCH_LIMIT_STORAGE_KEY,
  QUERY_EDITOR_MAX_FETCH_LIMIT,
  QUERY_EDITOR_RECOMMENDED_FETCH_LIMIT,
} from '@/features/query-editor/query-editor-fetch.constants'

export function clampFetchLimit(value: number): number {
  if (!Number.isFinite(value)) {
    return QUERY_EDITOR_DEFAULT_FETCH_LIMIT
  }

  return Math.min(
    QUERY_EDITOR_MAX_FETCH_LIMIT,
    Math.max(1, Math.round(value)),
  )
}

export function parseFetchLimitInput(value: string): number {
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed)) {
    return QUERY_EDITOR_DEFAULT_FETCH_LIMIT
  }

  return clampFetchLimit(parsed)
}

export function exceedsRecommendedFetchLimit(
  value: number,
  recommended = QUERY_EDITOR_RECOMMENDED_FETCH_LIMIT,
): boolean {
  return value > recommended
}

export function loadPersistedFetchLimit(): number {
  if (typeof sessionStorage === 'undefined') {
    return QUERY_EDITOR_DEFAULT_FETCH_LIMIT
  }

  const raw = sessionStorage.getItem(QUERY_EDITOR_FETCH_LIMIT_STORAGE_KEY)
  if (!raw) {
    return QUERY_EDITOR_DEFAULT_FETCH_LIMIT
  }

  const parsed = Number.parseInt(raw, 10)
  if (Number.isNaN(parsed)) {
    return QUERY_EDITOR_DEFAULT_FETCH_LIMIT
  }

  return clampFetchLimit(parsed)
}

export function savePersistedFetchLimit(value: number): void {
  if (typeof sessionStorage === 'undefined') {
    return
  }

  sessionStorage.setItem(
    QUERY_EDITOR_FETCH_LIMIT_STORAGE_KEY,
    String(clampFetchLimit(value)),
  )
}
