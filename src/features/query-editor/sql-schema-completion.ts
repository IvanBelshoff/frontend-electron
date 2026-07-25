import type { CompletionContext, CompletionResult } from '@codemirror/autocomplete'
import {
  buildParameterCompletionItems,
  buildSqlCompletionItems,
  filterByPrefix,
  filterCompletionItems,
  filterParameterCompletionItems,
  type SqlCompletionItem,
} from '@/components/sql-editor/sql-completion'
import type { TipoConexao } from '@/features/connections/connection-types'
import {
  getColumnsForCompletion,
  resolveSqlCompletionContext,
} from '@/features/query-editor/sql-completion-context'
import type { SchemaCompletionContext } from '@/features/query-editor/query-editor-types'
import type { ParametroRelatorio } from '@/features/reports/report-types'

export type SchemaMetadataLoader = {
  ensureSchemaTables: (escopo: string) => Promise<string[]>
  ensureTableColumns: (escopo: string, tabela: string) => Promise<string[]>
}

const VALID_IDENTIFIER = /^[\w.]*$/

function toCompletionOptions(items: SqlCompletionItem[]) {
  return items.map((item) => ({
    label: item.label,
    type: item.type,
    detail: item.detail,
    apply: item.insertText ?? item.label,
  }))
}

function buildColumnItems(columns: string[], partial: string): SqlCompletionItem[] {
  const items: SqlCompletionItem[] = columns.map((column) => ({
    label: column,
    type: 'keyword',
    detail: 'coluna',
  }))

  return filterByPrefix(items, partial)
}

function buildSchemaTableItems(
  schema: string,
  tables: string[],
  partial: string,
): SqlCompletionItem[] {
  const items: SqlCompletionItem[] = tables.map((table) => ({
    label: table,
    type: 'keyword',
    detail: `${schema}.${table}`,
    insertText: table,
  }))

  return filterByPrefix(items, partial)
}

function buildFromTableItems(
  schemaContext: SchemaCompletionContext,
  partial: string,
): SqlCompletionItem[] {
  const items: SqlCompletionItem[] = []

  for (const [schema, tables] of Object.entries(schemaContext.schemas)) {
    for (const table of tables) {
      items.push({
        label: table,
        type: 'keyword',
        detail: `${schema}.${table}`,
      })
    }
  }

  return filterByPrefix(items, partial)
}

function columnCompletionResult(
  items: SqlCompletionItem[],
  from: number,
  explicit: boolean,
): CompletionResult | null {
  if (items.length === 0 && !explicit) {
    return null
  }

  return {
    from,
    options: toCompletionOptions(items),
    validFor: VALID_IDENTIFIER,
  }
}

function tableCompletionResult(
  items: SqlCompletionItem[],
  from: number,
  explicit: boolean,
): CompletionResult | null {
  if (items.length === 0 && !explicit) {
    return null
  }

  return {
    from,
    options: toCompletionOptions(items),
    validFor: VALID_IDENTIFIER,
  }
}

export function createSchemaCompletionSource(
  connectionTipo: TipoConexao | null | undefined,
  parametros: ParametroRelatorio[],
  schemaContext: SchemaCompletionContext,
  metadataLoader?: SchemaMetadataLoader,
) {
  return (context: CompletionContext): CompletionResult | null | Promise<CompletionResult | null> => {
    const parameterMatch = context.matchBefore(/:\w*/)

    if (parameterMatch) {
      const items = filterParameterCompletionItems(
        buildParameterCompletionItems(parametros),
        parameterMatch.text,
      )

      if (items.length === 0 && !context.explicit) {
        return null
      }

      return {
        from: parameterMatch.from,
        options: toCompletionOptions(items),
      }
    }

    const doc = context.state.doc.toString()
    const completionContext = resolveSqlCompletionContext(doc, context.pos, schemaContext)

    if (completionContext.kind === 'column' || completionContext.kind === 'aliasColumn') {
      const partial = completionContext.partial ?? ''
      const columnFrom =
        completionContext.partial !== undefined
          ? context.pos - partial.length
          : context.pos

      const columns = getColumnsForCompletion(schemaContext, completionContext)

      if (columns.length > 0) {
        return columnCompletionResult(
          buildColumnItems(columns, partial),
          columnFrom,
          context.explicit,
        )
      }

      if (
        metadataLoader &&
        completionContext.schema &&
        completionContext.table
      ) {
        return metadataLoader
          .ensureTableColumns(completionContext.schema, completionContext.table)
          .then((loaded) =>
            columnCompletionResult(
              buildColumnItems(loaded, partial),
              columnFrom,
              context.explicit,
            ),
          )
      }

      return columnCompletionResult([], columnFrom, context.explicit)
    }

    if (completionContext.kind === 'schemaTables') {
      const schema = completionContext.schema ?? ''
      const cached = schemaContext.schemas[schema] ?? []
      const from = context.pos

      if (cached.length > 0) {
        return tableCompletionResult(
          buildSchemaTableItems(schema, cached, ''),
          from,
          context.explicit,
        )
      }

      if (metadataLoader && schema) {
        return metadataLoader.ensureSchemaTables(schema).then((tables) =>
          tableCompletionResult(
            buildSchemaTableItems(schema, tables, ''),
            from,
            context.explicit,
          ),
        )
      }

      return tableCompletionResult([], from, context.explicit)
    }

    if (completionContext.kind === 'tablePartial') {
      const schema = completionContext.schema ?? ''
      const partial = completionContext.partial ?? ''
      const cached = schemaContext.schemas[schema] ?? []
      const from = context.pos - partial.length

      if (cached.length > 0) {
        return tableCompletionResult(
          buildSchemaTableItems(schema, cached, partial),
          from,
          context.explicit,
        )
      }

      if (metadataLoader && schema) {
        return metadataLoader.ensureSchemaTables(schema).then((tables) =>
          tableCompletionResult(
            buildSchemaTableItems(schema, tables, partial),
            from,
            context.explicit,
          ),
        )
      }

      return tableCompletionResult([], from, context.explicit)
    }

    if (completionContext.kind === 'fromTable') {
      const partial = completionContext.partial ?? completionContext.token
      const items = buildFromTableItems(schemaContext, partial)

      if (items.length > 0 || context.explicit) {
        return tableCompletionResult(items, completionContext.tokenFrom, context.explicit)
      }
    }

    const wordMatch = context.matchBefore(/[\w.]+/)

    if (!wordMatch && !context.explicit) {
      return null
    }

    const items = filterCompletionItems(
      buildSqlCompletionItems(connectionTipo),
      wordMatch?.text ?? '',
    )

    if (items.length === 0) {
      return null
    }

    return {
      from: wordMatch?.from ?? context.pos,
      options: toCompletionOptions(items),
    }
  }
}
