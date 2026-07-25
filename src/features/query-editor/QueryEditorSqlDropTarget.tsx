import { useDroppable } from '@dnd-kit/core'
import clsx from 'clsx'
import type { ReactNode } from 'react'
import { QUERY_EDITOR_SQL_DROP_ID } from '@/features/query-editor/query-editor-dnd.utils'

type QueryEditorSqlDropTargetProps = {
  children: ReactNode
  isDragActive?: boolean
  className?: string
}

export default function QueryEditorSqlDropTarget({
  children,
  isDragActive = false,
  className,
}: QueryEditorSqlDropTargetProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: QUERY_EDITOR_SQL_DROP_ID,
    disabled: !isDragActive,
  })

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        'h-full min-h-0 rounded-md transition-shadow',
        isDragActive && isOver && 'ring-2 ring-vscode-accent/40',
        className,
      )}
    >
      {children}
    </div>
  )
}
