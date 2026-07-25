import { describe, expect, it } from 'vitest'

function collectLocalDiagnostics(sql: string) {
  const diagnostics: Array<{ message: string }> = []
  const trimmed = sql.trim()

  if (trimmed.includes(';')) {
    diagnostics.push({ message: 'Múltiplos statements não são permitidos.' })
  }

  if (!/^\s*SELECT\b/i.test(trimmed) && !/^\s*WITH\b/i.test(trimmed)) {
    diagnostics.push({ message: 'Somente queries SELECT ou WITH são permitidas.' })
  }

  return diagnostics
}

describe('sql query linter rules', () => {
  it('flags multiple statements', () => {
    const diagnostics = collectLocalDiagnostics('SELECT 1; DROP TABLE x')
    expect(diagnostics.some((item) => item.message.includes('Múltiplos'))).toBe(true)
  })

  it('warns when query is not select/with', () => {
    const diagnostics = collectLocalDiagnostics('DELETE FROM usuarios')
    expect(diagnostics.some((item) => item.message.includes('SELECT'))).toBe(true)
  })
})
