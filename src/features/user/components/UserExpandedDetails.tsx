import DataGridDetailsGrid, {
  DataGridDetailsField,
} from '@/components/data-grid/DataGridDetailsGrid'
import UserAccessFlow from '@/features/user/components/UserAccessFlow'
import { formatUserDate } from '@/features/user/format-user-date'
import { hasUserAccessData } from '@/features/user/has-user-access-data'
import type { ManagedUser } from '@/features/user/user-list-types'

type UserExpandedDetailsProps = {
  user: ManagedUser
  variant?: 'card' | 'table'
}

function formatOptionalText(value: string | null | undefined): string {
  if (!value?.trim()) {
    return 'Não informado'
  }

  return value.trim()
}

function UserMetadataFields({ user }: { user: ManagedUser }) {
  return (
    <DataGridDetailsGrid>
      <DataGridDetailsField label="Último login">
        {formatUserDate(user.ultimoLogin)}
      </DataGridDetailsField>
      <DataGridDetailsField label="Data de criação">
        {formatUserDate(user.dataCriacao)}
      </DataGridDetailsField>
      <DataGridDetailsField label="Atualizado por">
        {formatOptionalText(user.usuarioAtualizador)}
      </DataGridDetailsField>
      <DataGridDetailsField label="Data de atualização">
        {formatUserDate(user.dataAtualizacao)}
      </DataGridDetailsField>
      <DataGridDetailsField label="Criado por">
        {formatOptionalText(user.usuarioCadastrador)}
      </DataGridDetailsField>
    </DataGridDetailsGrid>
  )
}

export default function UserExpandedDetails({
  user,
  variant = 'card',
}: UserExpandedDetailsProps) {
  const showAccessFlow = hasUserAccessData(user)

  if (variant === 'table') {
    return <UserMetadataFields user={user} />
  }

  return (
    <div className="min-w-0 space-y-3 border-t border-vscode-border pt-3">
      <UserMetadataFields user={user} />
      {showAccessFlow ? <UserAccessFlow user={user} /> : null}
    </div>
  )
}
