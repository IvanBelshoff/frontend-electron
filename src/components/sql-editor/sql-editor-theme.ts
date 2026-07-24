import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'
import type { ResolvedTheme } from '@/features/settings/settings-types'

export function createSqlEditorTheme(hasError: boolean, mode: ResolvedTheme) {
  return EditorView.theme(
    {
      '&': {
        backgroundColor: 'var(--vscode-input-bg)',
        color: 'var(--vscode-text)',
      },
      '.cm-scroller': {
        backgroundColor: 'var(--vscode-input-bg)',
      },
      '.cm-content': {
        caretColor: 'var(--vscode-accent)',
        color: 'var(--vscode-text)',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: '0.875rem',
        lineHeight: '1.5',
      },
      '.cm-line': {
        color: 'var(--vscode-text)',
      },
      '.cm-cursor, .cm-dropCursor': {
        borderLeftColor: 'var(--vscode-accent)',
      },
      '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
        backgroundColor: 'rgb(var(--vscode-accent-rgb) / 0.25)',
      },
      '.cm-activeLine': {
        backgroundColor: 'rgb(var(--vscode-accent-rgb) / 0.08)',
      },
      '.cm-gutters': {
        display: 'none',
      },
      '&.cm-editor': {
        borderRadius: '0.375rem',
        border: hasError ? '1px solid var(--vscode-error)' : '1px solid var(--vscode-border)',
        backgroundColor: 'var(--vscode-input-bg)',
      },
      '&.cm-editor.cm-focused': {
        outline: 'none',
        boxShadow: hasError
          ? '0 0 0 2px rgb(244 135 113 / 0.3)'
          : '0 0 0 2px rgb(var(--vscode-accent-rgb) / 0.3)',
      },
      '.cm-placeholder': {
        color: 'var(--vscode-text-muted)',
      },
      '.cm-tooltip-autocomplete': {
        backgroundColor: 'var(--vscode-sidebar)',
        color: 'var(--vscode-text)',
        border: '1px solid var(--vscode-border)',
      },
      '.cm-tooltip-autocomplete > ul > li[aria-selected]': {
        backgroundColor: 'rgb(var(--vscode-accent-rgb) / 0.2)',
        color: 'var(--vscode-text)',
      },
    },
    { dark: mode === 'dark' },
  )
}

const darkSqlHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#569cd6' },
  { tag: [t.string, t.special(t.string)], color: '#ce9178' },
  { tag: [t.number, t.bool], color: '#b5cea8' },
  { tag: t.comment, color: '#6a9955', fontStyle: 'italic' },
  { tag: t.operator, color: '#d4d4d4' },
  { tag: t.variableName, color: '#9cdcfe' },
  { tag: t.function(t.variableName), color: '#dcdcaa' },
  { tag: t.typeName, color: '#4ec9b0' },
  { tag: t.propertyName, color: '#9cdcfe' },
])

const lightSqlHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#0000ff' },
  { tag: [t.string, t.special(t.string)], color: '#a31515' },
  { tag: [t.number, t.bool], color: '#098658' },
  { tag: t.comment, color: '#008000', fontStyle: 'italic' },
  { tag: t.operator, color: '#333333' },
  { tag: t.variableName, color: '#001080' },
  { tag: t.function(t.variableName), color: '#795e26' },
  { tag: t.typeName, color: '#267f99' },
  { tag: t.propertyName, color: '#001080' },
])

export function createSqlSyntaxHighlighting(mode: ResolvedTheme) {
  return syntaxHighlighting(mode === 'dark' ? darkSqlHighlightStyle : lightSqlHighlightStyle)
}
