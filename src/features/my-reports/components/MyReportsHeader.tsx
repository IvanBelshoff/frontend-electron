import { RefreshIcon } from '@/components/settings/SettingsIcons'
import IconButton from '@/components/ui/IconButton'
import { useCurrentUser } from '@/features/user/use-current-user'
import { getUserDisplayName } from '@/features/user/user-list-types'

type MyReportsHeaderProps = {
  filteredCount: number
  totalCount: number
  isRefreshing: boolean
  onRefresh: () => void
}

export default function MyReportsHeader({
  filteredCount,
  totalCount,
  isRefreshing,
  onRefresh,
}: MyReportsHeaderProps) {
  const currentUserQuery = useCurrentUser()
  const displayName = currentUserQuery.data
    ? getUserDisplayName({
        nome: currentUserQuery.data.nome,
        sobrenome: currentUserQuery.data.sobrenome,
      })
    : 'bem-vindo'

  return (
    <header className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="bg-gradient-to-r from-vscode-text to-vscode-accent bg-clip-text text-3xl font-bold tracking-tight text-transparent">
            Meus Relatórios
          </h1>
          <p className="mt-1 text-sm text-vscode-text-muted">
            Olá, {displayName}. Execute e visualize os relatórios disponíveis para você.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-vscode-border bg-vscode-sidebar/80 px-3 py-1 text-xs text-vscode-text-muted">
            Exibindo {filteredCount} de {totalCount} relatórios
          </span>

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
            label="Atualizar listagem"
            title="Atualizar listagem"
            onClick={onRefresh}
            disabled={isRefreshing}
          />
        </div>
      </div>
    </header>
  )
}
