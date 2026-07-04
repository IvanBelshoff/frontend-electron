import UserAccessFlow from '@/features/user/components/UserAccessFlow'
import { formatUserDate } from '@/features/user/format-user-date'
import type { ManagedUser } from '@/features/user/user-list-types'

type UserExpandedDetailsProps = {
  user: ManagedUser
}

function formatOptionalText(value: string | null | undefined): string {
  if (!value?.trim()) {
    return 'Não informado'
  }

  return value.trim()
}

export default function UserExpandedDetails({ user }: UserExpandedDetailsProps) {
  return (
    <div className="min-w-0 space-y-3 border-t border-vscode-border pt-3">
      <div className="grid min-w-0 grid-cols-1 gap-x-3 gap-y-2 text-xs text-vscode-text-muted sm:grid-cols-2">
        <p className="min-w-0 break-words">
          <strong className="font-semibold text-vscode-text-muted">Último login:</strong>{' '}
          {formatUserDate(user.ultimoLogin)}
        </p>
        <p className="min-w-0 break-words">
          <strong className="font-semibold text-vscode-text-muted">Data de criação:</strong>{' '}
          {formatUserDate(user.dataCriacao)}
        </p>
        <p className="min-w-0 break-words">
          <strong className="font-semibold text-vscode-text-muted">Atualizado por:</strong>{' '}
          {formatOptionalText(user.usuarioAtualizador)}
        </p>
        <p className="min-w-0 break-words">
          <strong className="font-semibold text-vscode-text-muted">Data de atualização:</strong>{' '}
          {formatUserDate(user.dataAtualizacao)}
        </p>
        <p className="min-w-0 break-words">
          <strong className="font-semibold text-vscode-text-muted">Criado por:</strong>{' '}
          {formatOptionalText(user.usuarioCadastrador)}
        </p>
      </div>

      <UserAccessFlow user={user} />
    </div>
  )
}
