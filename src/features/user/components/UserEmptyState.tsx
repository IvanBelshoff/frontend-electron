import Button from '@/components/ui/Button'
import { UsersEmptyIcon } from '@/features/user/components/UserIcons'

type UserEmptyStateProps = {
  onClearSearch: () => void
}

export default function UserEmptyState({ onClearSearch }: UserEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-vscode-border bg-vscode-sidebar/50 px-6 py-16 text-center">
      <span className="mb-4 text-vscode-text-muted">
        <UsersEmptyIcon />
      </span>

      <h3 className="text-base font-semibold text-vscode-text">Nenhum usuário encontrado</h3>
      <p className="mt-1 max-w-sm text-sm text-vscode-text-muted">
        Ajuste a busca para encontrar usuários ou limpe o termo pesquisado.
      </p>

      <Button variant="secondary" size="sm" className="mt-5" onClick={onClearSearch}>
        Limpar busca
      </Button>
    </div>
  )
}
