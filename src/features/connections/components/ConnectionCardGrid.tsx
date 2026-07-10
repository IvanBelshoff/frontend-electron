import ConnectionCard from '@/features/connections/components/ConnectionCard'
import ConnectionEmptyState from '@/features/connections/components/ConnectionEmptyState'
import type { Connection } from '@/features/connections/connection-types'

type ConnectionCardGridProps = {
  connections: Connection[]
  onEdit: (connection: Connection) => void
  onDelete: (connection: Connection) => void
  onClearFilters: () => void
  canEdit?: boolean
  canDelete?: boolean
}

export default function ConnectionCardGrid({
  connections,
  onEdit,
  onDelete,
  onClearFilters,
  canEdit = true,
  canDelete = true,
}: ConnectionCardGridProps) {
  if (connections.length === 0) {
    return <ConnectionEmptyState onClearFilters={onClearFilters} />
  }

  return (
    <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,18rem),1fr))]">
      {connections.map((connection) => (
        <div key={connection.id} className="min-w-0">
          <ConnectionCard
            connection={connection}
            onEdit={onEdit}
            onDelete={onDelete}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        </div>
      ))}
    </div>
  )
}
