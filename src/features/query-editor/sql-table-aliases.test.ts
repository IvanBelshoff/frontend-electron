import { describe, expect, it } from 'vitest'
import { parseTableAliases } from '@/features/query-editor/sql-table-aliases'

describe('parseTableAliases', () => {
  it('maps explicit alias with AS', () => {
    const aliases = parseTableAliases('SELECT * FROM public.usuarios AS u')

    expect(aliases.get('u')).toEqual({ schema: 'public', table: 'usuarios' })
  })

  it('maps implicit alias without AS', () => {
    const aliases = parseTableAliases('SELECT * FROM public.usuarios u')

    expect(aliases.get('u')).toEqual({ schema: 'public', table: 'usuarios' })
  })

  it('maps table name when no alias is provided', () => {
    const aliases = parseTableAliases('SELECT * FROM public.usuarios')

    expect(aliases.get('usuarios')).toEqual({ schema: 'public', table: 'usuarios' })
  })

  it('parses multiple joins with distinct aliases', () => {
    const sql = `
      SELECT *
      FROM vendas.pedidos p
      JOIN vendas.itens i ON i.pedido_id = p.id
    `
    const aliases = parseTableAliases(sql)

    expect(aliases.get('p')).toEqual({ schema: 'vendas', table: 'pedidos' })
    expect(aliases.get('i')).toEqual({ schema: 'vendas', table: 'itens' })
  })
})
