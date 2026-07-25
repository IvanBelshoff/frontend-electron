import { parseTableAliases } from '@/features/query-editor/sql-table-aliases'

export type SqlReferencedIdentifiers = {
  schemas: ReadonlySet<string>
  qualifiedTables: ReadonlySet<string>
  unqualifiedTables: ReadonlySet<string>
  qualifiedColumns: ReadonlySet<string>
  tableColumns: ReadonlyMap<string, ReadonlySet<string>>
}

const EMPTY_SET = new Set<string>()
const EMPTY_MAP = new Map<string, ReadonlySet<string>>()

const EMPTY_REFERENCES: SqlReferencedIdentifiers = {
  schemas: EMPTY_SET,
  qualifiedTables: EMPTY_SET,
  unqualifiedTables: EMPTY_SET,
  qualifiedColumns: EMPTY_SET,
  tableColumns: EMPTY_MAP,
}

const QUALIFIED_REFERENCE_PATTERN =
  /\b([a-zA-Z_][\w]*)\.([a-zA-Z_][\w]*)(?:\.([a-zA-Z_][\w]*))?\b/g

function normalizeKey(...parts: string[]): string {
  return parts.map((part) => part.toLowerCase()).join('::')
}

function stripSqlLiteralsAndComments(sql: string): string {
  return sql
    .replace(/'[^']*'/g, "''")
    .replace(/"[^"]*"/g, '""')
    .replace(/--[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
}

function addTableColumn(
  tableColumns: Map<string, Set<string>>,
  table: string,
  column: string,
): void {
  const tableKey = table.toLowerCase()
  const existing = tableColumns.get(tableKey) ?? new Set<string>()
  existing.add(column.toLowerCase())
  tableColumns.set(tableKey, existing)
}

function registerQualifiedTable(
  schemas: Set<string>,
  qualifiedTables: Set<string>,
  schema: string,
  table: string,
): void {
  schemas.add(schema.toLowerCase())
  qualifiedTables.add(normalizeKey(schema, table))
}

function registerQualifiedColumn(
  schemas: Set<string>,
  qualifiedTables: Set<string>,
  qualifiedColumns: Set<string>,
  schema: string,
  table: string,
  column: string,
): void {
  registerQualifiedTable(schemas, qualifiedTables, schema, table)
  qualifiedColumns.add(normalizeKey(schema, table, column))
}

export function parseSqlReferencedIdentifiers(sql: string): SqlReferencedIdentifiers {
  const trimmed = sql.trim()

  if (!trimmed) {
    return EMPTY_REFERENCES
  }

  const schemas = new Set<string>()
  const qualifiedTables = new Set<string>()
  const unqualifiedTables = new Set<string>()
  const qualifiedColumns = new Set<string>()
  const tableColumns = new Map<string, Set<string>>()

  const cleaned = stripSqlLiteralsAndComments(trimmed)
  const aliases = parseTableAliases(cleaned)

  for (const target of aliases.values()) {
    if (target.schema) {
      registerQualifiedTable(schemas, qualifiedTables, target.schema, target.table)
      continue
    }

    unqualifiedTables.add(target.table.toLowerCase())
  }

  for (const match of cleaned.matchAll(QUALIFIED_REFERENCE_PATTERN)) {
    const first = match[1]
    const second = match[2]
    const third = match[3]

    if (!first || !second) {
      continue
    }

    if (third) {
      registerQualifiedColumn(schemas, qualifiedTables, qualifiedColumns, first, second, third)
      continue
    }

    const aliasTarget = aliases.get(first.toLowerCase())

    if (aliasTarget) {
      addTableColumn(tableColumns, aliasTarget.table, second)

      if (aliasTarget.schema) {
        qualifiedColumns.add(
          normalizeKey(aliasTarget.schema, aliasTarget.table, second),
        )
      }

      continue
    }

    registerQualifiedTable(schemas, qualifiedTables, first, second)
  }

  return {
    schemas,
    qualifiedTables,
    unqualifiedTables,
    qualifiedColumns,
    tableColumns,
  }
}

export function isSchemaReferenced(
  references: SqlReferencedIdentifiers,
  schema: string,
): boolean {
  const normalizedSchema = schema.toLowerCase()

  if (references.schemas.has(normalizedSchema)) {
    return true
  }

  const prefix = `${normalizedSchema}::`

  for (const qualifiedTable of references.qualifiedTables) {
    if (qualifiedTable.startsWith(prefix)) {
      return true
    }
  }

  return false
}

export function isSchemaReferencedInExplorer(
  references: SqlReferencedIdentifiers,
  schema: string,
  tableNamesInSchema: readonly string[],
): boolean {
  if (isSchemaReferenced(references, schema)) {
    return true
  }

  return tableNamesInSchema.some((table) => isTableReferenced(references, schema, table))
}

export function isTableReferenced(
  references: SqlReferencedIdentifiers,
  escopo: string,
  tabela: string,
): boolean {
  const normalizedTable = tabela.toLowerCase()

  if (references.qualifiedTables.has(normalizeKey(escopo, tabela))) {
    return true
  }

  return references.unqualifiedTables.has(normalizedTable)
}

export function isColumnReferenced(
  references: SqlReferencedIdentifiers,
  escopo: string,
  tabela: string,
  coluna: string,
): boolean {
  const normalizedColumn = coluna.toLowerCase()

  if (references.qualifiedColumns.has(normalizeKey(escopo, tabela, coluna))) {
    return true
  }

  if (!isTableReferenced(references, escopo, tabela)) {
    return false
  }

  const columnsForTable = references.tableColumns.get(tabela.toLowerCase())

  return columnsForTable?.has(normalizedColumn) ?? false
}

export const SCHEMA_REFERENCE_TEXT_CLASS = 'font-medium text-vscode-accent'

export const TABLE_REFERENCE_TEXT_CLASS = 'text-vscode-accent'

export const COLUMN_REFERENCE_TEXT_CLASS = 'text-vscode-accent/80'
