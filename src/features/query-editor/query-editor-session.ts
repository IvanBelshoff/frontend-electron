import type {
  QueryEditorApplyResult,
  QueryEditorSession,
} from '@/features/query-editor/query-editor-types'

const SESSION_KEY = 'datadash:query-editor-session'
const RESULT_KEY = 'datadash:query-editor-result'

export function saveQueryEditorSession(session: QueryEditorSession): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function loadQueryEditorSession(): QueryEditorSession | null {
  const raw = sessionStorage.getItem(SESSION_KEY)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as QueryEditorSession
  } catch {
    return null
  }
}

export function clearQueryEditorSession(): void {
  sessionStorage.removeItem(SESSION_KEY)
}

export function saveQueryEditorResult(result: QueryEditorApplyResult): void {
  sessionStorage.setItem(RESULT_KEY, JSON.stringify(result))
}

export function consumeQueryEditorResult(): QueryEditorApplyResult | null {
  const raw = sessionStorage.getItem(RESULT_KEY)

  if (!raw) {
    return null
  }

  sessionStorage.removeItem(RESULT_KEY)

  try {
    return JSON.parse(raw) as QueryEditorApplyResult
  } catch {
    return null
  }
}
