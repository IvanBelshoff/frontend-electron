import UserCard from '@/features/user/components/UserCard'
import UserEmptyState from '@/features/user/components/UserEmptyState'
import type { ManagedUser } from '@/features/user/user-list-types'

type UserCardGridProps = {
  users: ManagedUser[]
  onEdit: (user: ManagedUser) => void
  onDelete: (user: ManagedUser) => void
  onClearFilters: () => void
}

export default function UserCardGrid({
  users,
  onEdit,
  onDelete,
  onClearFilters,
}: UserCardGridProps) {
  if (users.length === 0) {
    return <UserEmptyState onClearFilters={onClearFilters} />
  }

  return (
    <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,18rem),1fr))]">
      {users.map((user) => (
        <div key={user.id} className="min-w-0">
          <UserCard user={user} onEdit={onEdit} onDelete={onDelete} />
        </div>
      ))}
    </div>
  )
}
