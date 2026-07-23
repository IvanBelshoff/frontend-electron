import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Header, Table } from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'
import clsx from 'clsx'
import type { CSSProperties, ReactNode } from 'react'

type DataGridHeaderProps<T> = {
  table: Table<T>
  enableColumnReorder: boolean
  enableColumnResize: boolean
  enableSorting: boolean
  onColumnOrderChange: (order: string[]) => void
  getColumnWidth: (columnId: string, fallback: number) => number
  headerCellClass: string
  getHeaderColumnLineClass: (isLastColumn: boolean) => string
}

type HeaderCellProps<T> = {
  header: Header<T, unknown>
  enableColumnReorder: boolean
  enableColumnResize: boolean
  enableSorting: boolean
  getColumnWidth: (columnId: string, fallback: number) => number
  headerCellClass: string
  columnLineClass: string
}

function SortIcon({ direction }: { direction: 'asc' | 'desc' }) {
  return <span aria-hidden>{direction === 'asc' ? '↑' : '↓'}</span>
}

function getHeaderInteractionClass(canSort: boolean) {
  return canSort
    ? 'cursor-pointer select-none hover:text-vscode-text'
    : 'cursor-default select-none'
}

function SortableHeaderCell<T>({
  header,
  enableColumnReorder,
  enableColumnResize,
  enableSorting,
  getColumnWidth,
  headerCellClass,
  columnLineClass,
}: HeaderCellProps<T>) {
  const canSort = enableSorting && header.column.getCanSort()
  const canResize = enableColumnResize && header.column.getCanResize()
  const isLocked = header.column.columnDef.meta?.lockPosition === 'end'
  const columnWidth = getColumnWidth(header.column.id, header.getSize())
  const sortDirection = header.column.getIsSorted()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: header.column.id,
    disabled: !enableColumnReorder || isLocked,
  })

  const style: CSSProperties = {
    width: columnWidth,
    minWidth: columnWidth,
    flex: `0 0 ${columnWidth}px`,
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
  }

  return (
    <th
      ref={setNodeRef}
      style={style}
      className={clsx(
        headerCellClass,
        columnLineClass,
        getHeaderInteractionClass(canSort),
      )}
      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        {enableColumnReorder && !isLocked ? (
          <button
            type="button"
            className="cursor-grab text-vscode-text-muted/70 hover:text-vscode-text active:cursor-grabbing"
            aria-label={`Reordenar coluna ${header.column.id}`}
            onClick={(event) => event.stopPropagation()}
            {...attributes}
            {...listeners}
          >
            ⋮⋮
          </button>
        ) : null}

        <span className="min-w-0 flex-1 truncate">
          {header.isPlaceholder
            ? null
            : flexRender(header.column.columnDef.header, header.getContext())}
        </span>

        {canSort && sortDirection ? (
          <span className="shrink-0">
            <SortIcon direction={sortDirection as 'asc' | 'desc'} />
          </span>
        ) : null}
      </div>

      {canResize ? (
        <div
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          onClick={(event) => event.stopPropagation()}
          className={clsx(
            'absolute right-0 top-0 h-full w-1.5 cursor-col-resize touch-none select-none',
            header.column.getIsResizing()
              ? 'bg-vscode-accent'
              : 'bg-transparent hover:bg-vscode-accent/60',
          )}
          aria-hidden
        />
      ) : null}
    </th>
  )
}

function StaticHeaderCell<T>({
  header,
  enableColumnResize,
  enableSorting,
  getColumnWidth,
  headerCellClass,
  columnLineClass,
}: HeaderCellProps<T>) {
  const canSort = enableSorting && header.column.getCanSort()
  const canResize = enableColumnResize && header.column.getCanResize()
  const columnWidth = getColumnWidth(header.column.id, header.getSize())
  const sortDirection = header.column.getIsSorted()

  return (
    <th
      style={{
        width: columnWidth,
        minWidth: columnWidth,
        flex: `0 0 ${columnWidth}px`,
      }}
      className={clsx(
        headerCellClass,
        columnLineClass,
        getHeaderInteractionClass(canSort),
      )}
      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="min-w-0 flex-1 truncate">
          {header.isPlaceholder
            ? null
            : flexRender(header.column.columnDef.header, header.getContext())}
        </span>
        {canSort && sortDirection ? (
          <span className="shrink-0">
            <SortIcon direction={sortDirection as 'asc' | 'desc'} />
          </span>
        ) : null}
      </div>

      {canResize ? (
        <div
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          onClick={(event) => event.stopPropagation()}
          className={clsx(
            'absolute right-0 top-0 h-full w-1.5 cursor-col-resize touch-none select-none',
            header.column.getIsResizing()
              ? 'bg-vscode-accent'
              : 'bg-transparent hover:bg-vscode-accent/60',
          )}
          aria-hidden
        />
      ) : null}
    </th>
  )
}

export default function DataGridHeader<T>({
  table,
  enableColumnReorder,
  enableColumnResize,
  enableSorting,
  onColumnOrderChange,
  getColumnWidth,
  headerCellClass,
  getHeaderColumnLineClass,
}: DataGridHeaderProps<T>) {
  const headers = table.getHeaderGroups()[0]?.headers ?? []
  const sortableIds = headers
    .map((header) => header.column.id)
    .filter((id) => table.getColumn(id)?.columnDef.meta?.lockPosition !== 'end')

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) {
      return
    }

    const currentOrder = table.getState().columnOrder
    const order = currentOrder.length > 0 ? currentOrder : sortableIds
    const oldIndex = order.indexOf(String(active.id))
    const newIndex = order.indexOf(String(over.id))

    if (oldIndex < 0 || newIndex < 0) {
      return
    }

    onColumnOrderChange(arrayMove(order, oldIndex, newIndex))
  }

  const headerRow: ReactNode = (
    <tr className="flex w-full">
      {headers.map((header, index) =>
        enableColumnReorder ? (
          <SortableHeaderCell
            key={header.id}
            header={header}
            enableColumnReorder={enableColumnReorder}
            enableColumnResize={enableColumnResize}
            enableSorting={enableSorting}
            getColumnWidth={getColumnWidth}
            headerCellClass={headerCellClass}
            columnLineClass={getHeaderColumnLineClass(index === headers.length - 1)}
          />
        ) : (
          <StaticHeaderCell
            key={header.id}
            header={header}
            enableColumnReorder={false}
            enableColumnResize={enableColumnResize}
            enableSorting={enableSorting}
            getColumnWidth={getColumnWidth}
            headerCellClass={headerCellClass}
            columnLineClass={getHeaderColumnLineClass(index === headers.length - 1)}
          />
        ),
      )}
    </tr>
  )

  if (!enableColumnReorder) {
    return headerRow
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sortableIds} strategy={horizontalListSortingStrategy}>
        {headerRow}
      </SortableContext>
    </DndContext>
  )
}
