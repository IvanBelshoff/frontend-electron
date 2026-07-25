import { describe, expect, it } from 'vitest'
import { createSchemaCompletionSource } from '@/features/query-editor/sql-schema-completion'

function createContext(doc: string, pos: number, explicit = true) {
  return {
    state: {
      doc: {
        toString: () => doc,
        sliceString: (from: number, to: number) => doc.slice(from, to),
      },
    },
    pos,
    explicit,
    matchBefore: (pattern: RegExp) => {
      const prefix = doc.slice(0, pos)
      const matches = [...prefix.matchAll(new RegExp(pattern.source, 'g'))]
      const match = matches.at(-1)

      if (!match || match.index === undefined) {
        return null
      }

      return {
        text: match[0],
        from: match.index,
      }
    },
  }
}

async function resolveCompletion(
  doc: string,
  schemaContext: {
    schemas: Record<string, string[]>
    columnsByTable: Record<string, string[]>
  },
  metadataLoader?: {
    ensureSchemaTables: (escopo: string) => Promise<string[]>
    ensureTableColumns: (escopo: string, tabela: string) => Promise<string[]>
  },
) {
  const source = createSchemaCompletionSource('postgres', [], schemaContext, metadataLoader)
  const result = source(createContext(doc, doc.length) as never)

  if (result instanceof Promise) {
    return result
  }

  return result
}

describe('createSchemaCompletionSource', () => {
  const schemaContext = {
    schemas: {
      public: ['usuarios', 'relatorios'],
    },
    columnsByTable: {
      'public.usuarios': ['id', 'nome', 'email'],
      usuarios: ['id', 'nome', 'email'],
    },
  }

  it('suggests tables after FROM with simple prefix', async () => {
    const doc = 'SELECT * FROM usu'
    const result = await resolveCompletion(doc, schemaContext)

    expect(result?.options.some((option) => option.label === 'usuarios')).toBe(true)
  })

  it('suggests tables after schema dot', async () => {
    const doc = 'SELECT * FROM public.'
    const result = await resolveCompletion(doc, schemaContext)

    expect(result?.options.some((option) => option.label === 'usuarios')).toBe(true)
  })

  it('suggests partial qualified table names', async () => {
    const doc = 'SELECT * FROM public.usu'
    const result = await resolveCompletion(doc, schemaContext)

    expect(result?.options.some((option) => option.label === 'usuarios')).toBe(true)
  })

  it('suggests columns for alias away from FROM', async () => {
    const doc = 'SELECT u. FROM public.usuarios u'
    const source = createSchemaCompletionSource('postgres', [], schemaContext)
    const result = source(createContext(doc, 9) as never)

    expect(result?.options.some((option) => option.label === 'nome')).toBe(true)
  })

  it('loads schema tables lazily when cache is empty', async () => {
    let calls = 0
    const doc = 'SELECT * FROM vendas.'
    const result = await resolveCompletion(
      doc,
      { schemas: {}, columnsByTable: {} },
      {
        ensureSchemaTables: async (escopo) => {
          calls += 1
          expect(escopo).toBe('vendas')
          return ['pedidos', 'itens']
        },
        ensureTableColumns: async () => [],
      },
    )

    expect(calls).toBe(1)
    expect(result?.options.some((option) => option.label === 'pedidos')).toBe(true)
  })

  it('loads columns lazily when cache is empty', async () => {
    let calls = 0
    const doc = 'SELECT * FROM public.usuarios.'
    const result = await resolveCompletion(
      doc,
      { schemas: { public: ['usuarios'] }, columnsByTable: {} },
      {
        ensureSchemaTables: async () => [],
        ensureTableColumns: async (escopo, tabela) => {
          calls += 1
          expect(escopo).toBe('public')
          expect(tabela).toBe('usuarios')
          return ['id', 'email']
        },
      },
    )

    expect(calls).toBe(1)
    expect(result?.options.some((option) => option.label === 'email')).toBe(true)
  })
})
