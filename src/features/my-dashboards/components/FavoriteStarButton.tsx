import clsx from 'clsx'
import { StarFilledIcon, StarIcon } from '@/features/dashboards/icons/DashboardIcons'

type FavoriteStarButtonProps = {
  isFavorite: boolean
  isLoading?: boolean
  label: string
  onToggle: () => void
  className?: string
}

export default function FavoriteStarButton({
  isFavorite,
  isLoading = false,
  label,
  onToggle,
  className,
}: FavoriteStarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      onClick={(event) => {
        event.stopPropagation()
        onToggle()
      }}
      disabled={isLoading}
      className={clsx(
        'group inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400/40',
        isFavorite
          ? 'border-amber-400/50 bg-amber-400/15 text-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.25)] hover:bg-amber-400/25'
          : 'border-vscode-border bg-vscode-input-bg/60 text-vscode-text-muted hover:border-amber-400/40 hover:bg-amber-400/10 hover:text-amber-300',
        isLoading && 'pointer-events-none opacity-60',
        className,
      )}
    >
      {isFavorite ? (
        <StarFilledIcon className="h-5 w-5" />
      ) : (
        <StarIcon className="h-5 w-5" />
      )}
    </button>
  )
}
