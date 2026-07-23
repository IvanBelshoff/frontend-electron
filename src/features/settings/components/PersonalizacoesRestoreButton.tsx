import { RefreshIcon } from '@/components/settings/SettingsIcons'
import IconButton from '@/components/ui/IconButton'
import { usePersonalizacoesRestore } from '@/features/settings/hooks/use-personalizacoes-restore'
import type { PersonalizacoesTab } from '@/features/settings/personalizacoes-types'

type PersonalizacoesRestoreButtonProps = {
  activeTab: PersonalizacoesTab
}

export default function PersonalizacoesRestoreButton({
  activeTab,
}: PersonalizacoesRestoreButtonProps) {
  const restore = usePersonalizacoesRestore(activeTab)

  return (
    <IconButton
      icon={<RefreshIcon />}
      label={restore.label}
      title={restore.title}
      onClick={restore.onClick}
      disabled={restore.disabled}
    />
  )
}
