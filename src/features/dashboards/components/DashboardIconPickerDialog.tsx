import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import { listIcons } from '@/features/dashboards/icon-api'
import {
  DashboardMaterialIcon,
  SearchIcon,
} from '@/features/dashboards/icons/DashboardIcons'
import { queryKeys } from '@/lib/query-keys'

const ICONS_PAGE_LIMIT = 60

type DashboardIconPickerDialogProps = {
  isOpen: boolean
  onClose: () => void
  selectedIcon: string
  defaultIcon: string
  onSelect: (icon: string) => void
}

export default function DashboardIconPickerDialog({
  isOpen,
  onClose,
  selectedIcon,
  defaultIcon,
  onSelect,
}: DashboardIconPickerDialogProps) {
  const [draftIcon, setDraftIcon] = useState(selectedIcon)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setDraftIcon(selectedIcon)
    setSearch('')
    setDebouncedSearch('')
    setPage(1)
  }, [isOpen, selectedIcon])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [search])

  const iconsQuery = useQuery({
    queryKey: queryKeys.dashboard.icons({
      page,
      limit: ICONS_PAGE_LIMIT,
      nome: debouncedSearch,
    }),
    queryFn: () =>
      listIcons({
        page,
        limit: ICONS_PAGE_LIMIT,
        nome: debouncedSearch || undefined,
      }),
    enabled: isOpen,
  })

  const icons = iconsQuery.data?.icons ?? []
  const totalCount = iconsQuery.data?.totalCount ?? 0
  const hasMore = icons.length < totalCount

  const handleShowAll = () => {
    if (totalCount === 0) {
      return
    }

    setPage(Math.ceil(totalCount / ICONS_PAGE_LIMIT))
  }

  const handleConfirm = () => {
    onSelect(draftIcon)
    onClose()
  }

  const handleRestore = () => {
    setDraftIcon(defaultIcon)
  }

  return (
    <Dialog
      isOpen={isOpen}
      title="Selecionar ícone"
      onClose={onClose}
      className="w-[96vw] max-w-5xl"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-vscode-border bg-vscode-bg/40 px-3 py-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-md border border-vscode-border bg-vscode-sidebar text-vscode-accent">
            <DashboardMaterialIcon name={draftIcon} className="text-[1.75rem]" filled />
          </span>

          <div className="min-w-0 flex-1">
            <span className="block text-xs text-vscode-text-muted">Ícone selecionado</span>
            <span className="block truncate font-mono text-sm text-vscode-text">{draftIcon}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={handleRestore}>
              Restaurar
            </Button>
            <Button type="button" size="sm" onClick={handleConfirm}>
              Selecionar
            </Button>
          </div>
        </div>

        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-vscode-text-muted">
            <SearchIcon />
          </span>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar ícone..."
            className="pl-9"
          />
        </div>

        {iconsQuery.isLoading ? (
          <div className="flex items-center justify-center py-12 text-sm text-vscode-text-muted">
            Carregando ícones...
          </div>
        ) : iconsQuery.isError ? (
          <div className="py-8 text-center text-sm text-vscode-error">
            Não foi possível carregar os ícones.
          </div>
        ) : icons.length === 0 ? (
          <div className="py-8 text-center text-sm text-vscode-text-muted">
            Nenhum ícone encontrado.
          </div>
        ) : (
          <div className="grid max-h-[32rem] grid-cols-6 gap-2.5 overflow-y-auto sm:grid-cols-8 lg:grid-cols-10">
            {icons.map((icon) => {
              const isSelected = draftIcon === icon

              return (
                <button
                  key={icon}
                  type="button"
                  title={icon}
                  onClick={() => setDraftIcon(icon)}
                  className={clsx(
                    'flex aspect-square items-center justify-center rounded border transition-colors',
                    isSelected
                      ? 'border-vscode-accent bg-vscode-accent/15 text-vscode-accent'
                      : 'border-vscode-border bg-vscode-sidebar text-vscode-text-muted hover:border-vscode-accent/40 hover:text-vscode-text',
                  )}
                >
                  <DashboardMaterialIcon name={icon} className="text-[1.5rem]" />
                </button>
              )
            })}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-vscode-border pt-3">
          <span className="text-xs text-vscode-text-muted">
            Exibindo {icons.length} de {totalCount} ícones
          </span>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!hasMore || iconsQuery.isFetching}
              onClick={() => setPage((current) => current + 1)}
            >
              Ver mais
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!hasMore || iconsQuery.isFetching}
              onClick={handleShowAll}
            >
              Ver tudo
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
