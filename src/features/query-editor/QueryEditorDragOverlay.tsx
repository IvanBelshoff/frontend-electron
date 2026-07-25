import type { SchemaExplorerActiveDrag } from '@/features/query-editor/query-editor-dnd.utils'

type QueryEditorDragOverlayProps = {
  activeDrag: SchemaExplorerActiveDrag | null
}

export default function QueryEditorDragOverlay({ activeDrag }: QueryEditorDragOverlayProps) {
  if (!activeDrag) {
    return null
  }

  const label =
    activeDrag.kind === 'table'
      ? activeDrag.qualifiedName
      : activeDrag.coluna

  return (
    <div className="cursor-grabbing rounded-md border border-vscode-border bg-vscode-sidebar px-3 py-1.5 text-sm font-medium text-vscode-text shadow-lg">
      {label}
    </div>
  )
}
