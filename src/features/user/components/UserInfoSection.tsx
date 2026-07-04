import SettingsCard from '@/components/settings/SettingsCard'
import SettingsCardHeader from '@/components/settings/SettingsCardHeader'
import SettingsInfoGrid from '@/components/settings/SettingsInfoGrid'
import { InfoIcon } from '@/components/settings/SettingsIcons'
import { formatUserDate } from '@/features/user/format-user-date'
import type { ManagedUser } from '@/features/user/user-list-types'

type UserInfoSectionProps = {
  user: ManagedUser
}

function formatOptionalText(value: string | null | undefined): string {
  if (!value?.trim()) {
    return 'Não informado'
  }

  return value.trim()
}

export default function UserInfoSection({ user }: UserInfoSectionProps) {
  return (
    <SettingsCard>
      <SettingsCardHeader
        icon={<InfoIcon />}
        title="Informações do usuário"
        description="Resumo de rastreabilidade do usuário."
      />

      <SettingsInfoGrid
        items={[
          {
            label: 'Criado por',
            value: formatOptionalText(user.usuarioCadastrador),
          },
          {
            label: 'Atualizado por',
            value: formatOptionalText(user.usuarioAtualizador),
          },
          {
            label: 'Data de criação',
            value: formatUserDate(user.dataCriacao),
          },
          {
            label: 'Data de atualização',
            value: formatUserDate(user.dataAtualizacao),
          },
          {
            label: 'Último login',
            value: formatUserDate(user.ultimoLogin),
          },
        ]}
      />
    </SettingsCard>
  )
}
