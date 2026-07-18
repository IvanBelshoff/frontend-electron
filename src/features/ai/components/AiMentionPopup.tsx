import clsx from 'clsx'
import type { AiMentionCategory, AiMentionListItem } from '@/features/ai/ai-mention-types'

type AiMentionPopupProps = {
  open: boolean
  mode: 'categories' | 'items'
  filter: string
  categories: AiMentionCategory[]
  items: AiMentionListItem[]
  activeIndex: number
  isLoading?: boolean
  onFilterChange: (value: string) => void
  onSelectCategory: (category: AiMentionCategory) => void
  onSelectDomain: (category: AiMentionCategory) => void
  onSelectItem: (item: AiMentionListItem) => void
  onBack: () => void
}

export default function AiMentionPopup({
  open,
  mode,
  filter,
  categories,
  items,
  activeIndex,
  isLoading = false,
  onFilterChange,
  onSelectCategory,
  onSelectDomain,
  onSelectItem,
  onBack,
}: AiMentionPopupProps) {
  if (!open) {
    return null
  }

  const rows =
    mode === 'categories'
      ? categories.map((category) => ({
          key: category.id,
          primary: category.label,
          secondary: 'Abrir lista',
          onClick: () => onSelectCategory(category),
          onDomain: () => onSelectDomain(category),
        }))
      : items.map((item) => ({
          key: String(item.id),
          primary: item.label,
          secondary: undefined as string | undefined,
          onClick: () => onSelectItem(item),
          onDomain: undefined as (() => void) | undefined,
        }))

  return (
    <div
      className="absolute bottom-full left-0 z-20 mb-2 w-full max-w-md overflow-hidden rounded border border-vscode-border bg-vscode-sidebar shadow-xl"
      role="listbox"
      aria-label="Sugestões de contexto"
    >
      <div className="flex items-center gap-2 border-b border-vscode-border px-2 py-1.5">
        {mode === 'items' && (
          <button
            type="button"
            className="rounded px-1.5 py-0.5 text-xs text-vscode-text-muted hover:bg-vscode-activity-bar hover:text-vscode-text"
            onClick={onBack}
          >
            ←
          </button>
        )}
        <input
          value={filter}
          onChange={(event) => onFilterChange(event.target.value)}
          placeholder={mode === 'categories' ? 'Filtrar categorias…' : 'Filtrar itens…'}
          className="h-7 flex-1 rounded border border-vscode-border bg-vscode-input-bg px-2 text-xs text-vscode-text outline-none focus:border-vscode-accent"
        />
      </div>

      <div className="max-h-56 overflow-y-auto py-1">
        {isLoading && (
          <p className="px-3 py-2 text-xs text-vscode-text-muted">Carregando…</p>
        )}

        {!isLoading && rows.length === 0 && (
          <p className="px-3 py-2 text-xs text-vscode-text-muted">Nenhum resultado.</p>
        )}

        {!isLoading &&
          rows.map((row, index) => (
            <div key={row.key} className="px-1">
              <button
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                className={clsx(
                  'flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm',
                  index === activeIndex
                    ? 'bg-vscode-accent/25 text-vscode-text'
                    : 'text-vscode-text hover:bg-vscode-activity-bar',
                )}
                onClick={row.onClick}
              >
                <span className="truncate">{row.primary}</span>
                {row.secondary && (
                  <span className="ml-2 shrink-0 text-[11px] text-vscode-text-muted">
                    {row.secondary}
                  </span>
                )}
              </button>
              {mode === 'categories' && row.onDomain && (
                <button
                  type="button"
                  className="mb-1 ml-2 rounded px-2 py-0.5 text-[11px] text-vscode-accent hover:bg-vscode-accent/15"
                  onClick={row.onDomain}
                >
                  Mencionar categoria inteira
                </button>
              )}
            </div>
          ))}
      </div>
    </div>
  )
}
