import SettingsField from '@/components/settings/SettingsField'
import Input from '@/components/ui/Input'
import MyProfilePasswordSection from '@/features/user-profile/components/MyProfilePasswordSection'
import MyProfilePhotoPanel from '@/features/user-profile/components/MyProfilePhotoPanel'
import UserProfileSummarySection from '@/features/user-profile/components/UserProfileSummarySection'
import type { UserProfileSummary } from '@/features/user-inbox/user-inbox-types'
import type { UserDetail } from '@/features/user/user-types'

type UserProfileTabProps = {
  user: UserDetail
  summary: UserProfileSummary | undefined
  isSummaryLoading: boolean
}

export default function UserProfileTab({
  user,
  summary,
  isSummaryLoading,
}: UserProfileTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)] lg:items-start">
        <MyProfilePhotoPanel user={user} />

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SettingsField label="Nome" htmlFor="profileNome">
              <Input id="profileNome" value={user.nome} readOnly disabled />
            </SettingsField>

            <SettingsField label="Sobrenome" htmlFor="profileSobrenome">
              <Input id="profileSobrenome" value={user.sobrenome} readOnly disabled />
            </SettingsField>
          </div>

          <SettingsField label="E-mail" htmlFor="profileEmail">
            <Input id="profileEmail" type="email" value={user.email} readOnly disabled />
          </SettingsField>

          <MyProfilePasswordSection isBlocked={user.bloqueado} />
        </div>
      </div>

      {isSummaryLoading && (
        <p className="text-sm text-vscode-text-muted">Carregando resumo da conta...</p>
      )}

      {summary && <UserProfileSummarySection summary={summary} />}
    </div>
  )
}
