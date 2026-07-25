import { linter, type Diagnostic } from '@codemirror/lint'
import type { EditorView } from '@codemirror/view'

const FORBIDDEN_KEYWORDS = [
  'INSERT',
  'UPDATE',
  'DELETE',
  'DROP',
  'TRUNCATE',
  'ALTER',
  'CREATE',
  'GRANT',
  'REVOKE',
  'MERGE',
  'EXEC',
  'EXECUTE',
  'CALL',
]

function collectLocalDiagnostics(doc: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = []
  const trimmed = doc.trim()

  if (!trimmed) {
    return diagnostics
  }

  if (trimmed.includes(';')) {
    const index = doc.indexOf(';')
    diagnostics.push({
      from: index,
      to: index + 1,
      severity: 'error',
      message: 'Múltiplos statements não são permitidos.',
    })
  }

  const upper = trimmed.toUpperCase()

  for (const keyword of FORBIDDEN_KEYWORDS) {
    const pattern = new RegExp(`\\b${keyword}\\b`, 'i')
    const match = pattern.exec(doc)

    if (match) {
      diagnostics.push({
        from: match.index,
        to: match.index + match[0].length,
        severity: 'error',
        message: `Operação não permitida: ${keyword}`,
      })
    }
  }

  if (!/^\s*SELECT\b/i.test(trimmed) && !/^\s*WITH\b/i.test(trimmed)) {
    diagnostics.push({
      from: 0,
      to: Math.min(doc.length, 20),
      severity: 'warning',
      message: 'Somente queries SELECT ou WITH são permitidas.',
    })
  }

  return diagnostics
}

export function createSqlQueryLinter(getExecutionError?: () => string | null) {
  return linter((view: EditorView) => {
    const doc = view.state.doc.toString()
    const diagnostics = collectLocalDiagnostics(doc)
    const executionError = getExecutionError?.()

    if (executionError) {
      diagnostics.push({
        from: 0,
        to: Math.min(doc.length, 1),
        severity: 'error',
        message: executionError,
      })
    }

    return diagnostics
  })
}
