import { describe, expect, it } from 'vitest'
import { insertColumnAtPosition } from '@/features/query-editor/sql-column-insert'
import {
  appendTableInsert,
  buildTableInsertSnippet,
  insertSnippetAtPosition,
  insertTableAtPosition,
  queryHasSelect,
} from '@/features/query-editor/sql-table-insert'

describe('queryHasSelect', () => {
  it('returns false for empty or whitespace-only query', () => {
    expect(queryHasSelect('')).toBe(false)
    expect(queryHasSelect('   ')).toBe(false)
  })

  it('returns true for any SELECT occurrence (case insensitive)', () => {
    expect(queryHasSelect('SELECT id FROM public.users')).toBe(true)
    expect(queryHasSelect('select * from x')).toBe(true)
  })

  it('returns false when query has no SELECT', () => {
    expect(queryHasSelect('-- draft')).toBe(false)
    expect(queryHasSelect('public.users')).toBe(false)
  })
})

describe('buildTableInsertSnippet', () => {
  it('generates SELECT * FROM when query has no SELECT', () => {
    expect(buildTableInsertSnippet('', 'public.users')).toBe('SELECT * FROM public.users')
    expect(buildTableInsertSnippet('-- draft', 'public.users')).toBe(
      'SELECT * FROM public.users',
    )
  })

  it('returns only qualified table when query already has SELECT', () => {
    expect(buildTableInsertSnippet('SELECT id FROM public.users', 'public.orders')).toBe(
      'public.orders',
    )
    expect(buildTableInsertSnippet('select * from x', 'public.orders')).toBe('public.orders')
  })
})

describe('appendTableInsert', () => {
  it('inserts full SELECT for empty query', () => {
    expect(appendTableInsert('', 'public.users')).toBe('SELECT * FROM public.users')
    expect(appendTableInsert('   ', 'public.users')).toBe('SELECT * FROM public.users')
  })

  it('appends qualified table with space when SELECT exists', () => {
    expect(appendTableInsert('SELECT id FROM public.users', 'public.orders')).toBe(
      'SELECT id FROM public.users public.orders',
    )
  })

  it('appends SELECT * FROM snippet for non-SELECT content', () => {
    expect(appendTableInsert('-- comentario', 'public.users')).toBe(
      '-- comentario SELECT * FROM public.users',
    )
  })
})

describe('insertSnippetAtPosition', () => {
  it('inserts snippet at start without leading space', () => {
    expect(insertSnippetAtPosition('FROM users', 0, 'SELECT')).toEqual({
      nextQuery: 'SELECT FROM users',
      cursor: 7,
      insertedText: 'SELECT ',
    })
  })

  it('adds leading and trailing space when inserting in the middle of text', () => {
    expect(insertSnippetAtPosition('SELECTFROM users', 6, ' * ')).toEqual({
      nextQuery: 'SELECT  *  FROM users',
      cursor: 11,
      insertedText: '  *  ',
    })
  })

  it('adds trailing space when needed', () => {
    expect(insertSnippetAtPosition('SELECT id', 9, 'name')).toEqual({
      nextQuery: 'SELECT id name',
      cursor: 14,
      insertedText: ' name',
    })
  })

  it('clamps position to query bounds', () => {
    expect(insertSnippetAtPosition('abc', 99, 'x')).toEqual({
      nextQuery: 'abc x',
      cursor: 5,
      insertedText: ' x',
    })
  })
})

describe('insertTableAtPosition', () => {
  it('inserts full SELECT for empty query', () => {
    expect(insertTableAtPosition('', 0, 'public.users')).toEqual({
      nextQuery: 'SELECT * FROM public.users',
      cursor: 'SELECT * FROM public.users'.length,
      insertedText: 'SELECT * FROM public.users',
    })
  })

  it('inserts qualified table when query already has SELECT', () => {
    const result = insertTableAtPosition('SELECT id FROM public.users', 6, 'public.orders')
    expect(result.nextQuery).toBe('SELECT public.orders id FROM public.users')
    expect(result.cursor).toBe('SELECT public.orders'.length)
  })
})

describe('insertColumnAtPosition', () => {
  it('inserts column name at position with spacing', () => {
    expect(insertColumnAtPosition('SELECTFROM users', 6, 'id')).toEqual({
      nextQuery: 'SELECT id FROM users',
      cursor: 10,
      insertedText: ' id ',
    })
  })

  it('inserts column into empty query', () => {
    expect(insertColumnAtPosition('', 0, 'id')).toEqual({
      nextQuery: 'id',
      cursor: 2,
      insertedText: 'id',
    })
  })
})
