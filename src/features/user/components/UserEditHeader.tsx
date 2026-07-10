import { RefreshIcon } from '@/components/settings/SettingsIcons'
import IconButton from '@/components/ui/IconButton'
import UserFormBreadcrumb from '@/features/user/components/UserFormBreadcrumb'
import { TrashIcon } from '@/features/dashboards/icons/DashboardIcons'

type UserEditHeaderProps = {
  userName: string
  isRefreshing: boolean
  onRefresh: () => void
  onDelete: () => void
  canDelete?: boolean
}

export default function UserEditHeader({
  userName,
  isRefreshing,
  onRefresh,
  onDelete,
  canDelete = true,
}: UserEditHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <UserFormBreadcrumb
        parent={{ label: 'Gerenciamento de Usuários', to: '/usuarios' }}
        current={userName}
      />

      <div className="flex items-center gap-2">
        <IconButton
          icon={
            isRefreshing ? (
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
                aria-hidden="true"
              />
            ) : (
              <RefreshIcon />
            )
          }
          label="Atualizar usuário"
          title="Atualizar usuário"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-9 w-9 rounded-full border border-vscode-border text-emerald-400 hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-emerald-300 disabled:opacity-50"
        />

        <IconButton
          icon={<TrashIcon className="h-4 w-4" />}
          label="Excluir usuário"
          title={
            canDelete ? 'Excluir usuário' : 'Você não possui permissão para excluir usuários.'
          }
          onClick={onDelete}
          disabled={!canDelete}
          className="h-9 w-9 rounded-full border border-vscode-border text-red-400 hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300 disabled:opacity-40"
        />
      </div>
    </header>
  )
}
