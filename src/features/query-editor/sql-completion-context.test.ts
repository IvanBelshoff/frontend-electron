import { describe, expect, it } from 'vitest'
import { resolveSqlCompletionContext } from '@/features/query-editor/sql-completion-context'

const schemaContext = {
  schemas: {
    public: ['usuarios', 'relatorios'],
    vendas: ['pedidos', 'itens'],
  },
  columnsByTable: {
    'public.usuarios': ['id', 'nome', 'email'],
    usuarios: ['id', 'nome', 'email'],
  },
}

describe('resolveSqlCompletionContext', () => {
  it('detects schema table list after schema dot', () => {
    const doc = 'SELECT * FROM public.'
    const context = resolveSqlCompletionContext(doc, doc.length, schemaContext)

    expect(context.kind).toBe('schemaTables')
    expect(context.schema).toBe('public')
  })

  it('detects partial qualified table name', () => {
    const doc = 'SELECT * FROM public.usu'
    const context = resolveSqlCompletionContext(doc, doc.length, schemaContext)

    expect(context.kind).toBe('tablePartial')
    expect(context.schema).toBe('public')
    expect(context.partial).toBe('usu')
  })

  it('detects column context after qualified table dot', () => {
    const doc = 'SELECT * FROM public.usuarios.'
    const context = resolveSqlCompletionContext(doc, doc.length, schemaContext)

    expect(context.kind).toBe('column')
    expect(context.schema).toBe('public')
    expect(context.table).toBe('usuarios')
  })

  it('detects alias column context away from FROM clause', () => {
    const doc = 'SELECT u. FROM public.usuarios u'
    const context = resolveSqlCompletionContext(doc, 9, schemaContext)

    expect(context.kind).toBe('aliasColumn')
    expect(context.alias).toBe('u')
    expect(context.table).toBe('usuarios')
  })

  it('detects unqualified FROM table prefix', () => {
    const doc = 'SELECT * FROM usu'
    const context = resolveSqlCompletionContext(doc, doc.length, schemaContext)

    expect(context.kind).toBe('fromTable')
    expect(context.partial).toBe('usu')
  })
})
