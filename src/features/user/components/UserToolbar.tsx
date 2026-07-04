import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import {
  PlusIcon,
  SearchIcon,
  ViewModeToggle,
} from '@/features/dashboards/icons/DashboardIcons'
import type { UserViewMode } from '@/features/user/user-list-types'

type UserToolbarProps = {
  search: string
  onSearchChange: (value: string) => void
  viewMode: UserViewMode
  onViewModeChange: (mode: UserViewMode) => void
  onCreate: () => void
}

export default function UserToolbar({
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onCreate,
}: UserToolbarProps) {
  return (
    <div className="rounded-lg border border-vscode-border bg-vscode-sidebar/80 p-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vscode-text-muted" />

          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Pesquisar usuários por nome, e-mail, regra ou permissão"
            className="pl-9"
            aria-label="Pesquisar usuários por nome, e-mail, regra ou permissão"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <ViewModeToggle value={viewMode} onChange={onViewModeChange} />

          <Button variant="primary" size="md" onClick={onCreate}>
            <PlusIcon />
            Criar
          </Button>
        </div>
      </div>
    </div>
  )
}
