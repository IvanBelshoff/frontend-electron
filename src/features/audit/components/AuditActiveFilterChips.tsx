import clsx from 'clsx'
import type { AuditAdvancedFilters, AuditFilters } from '@/features/audit/audit-types'
import {
  getAuditActionLabel,
  getAuditCategoryLabel,
  getAuditOutcomeLabel,
} from '@/features/audit/audit-labels'
import { toDateInputValue } from '@/lib/datetime'

type ActiveFilterChip = {
  key: keyof AuditAdvancedFilters
  label: string
}

type AuditActiveFilterChipsProps = {
  filters: AuditFilters
  onRemove: (key: keyof AuditAdvancedFilters) => void
}

function formatDateRangeLabel(from?: string, to?: string): string | null {
  if (!from && !to) {
    return null
  }

  const fromLabel = from ? toDateInputValue(from) : '…'
  const toLabel = to ? toDateInputValue(to) : '…'
  return `${fromLabel}–${toLabel}`
}

export function getActiveAuditFilterChips(filters: AuditFilters): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = []

  if (filters.actorUserId != null) {
    chips.push({
      key: 'actorUserId',
      label: `Usuário: #${filters.actorUserId}`,
    })
  }

  if (filters.action) {
    chips.push({
      key: 'action',
      label: `Ação: ${getAuditActionLabel(filters.action)}`,
    })
  }

  if (filters.category) {
    chips.push({
      key: 'category',
      label: `Categoria: ${getAuditCategoryLabel(filters.category)}`,
    })
  }

  if (filters.outcome) {
    chips.push({
      key: 'outcome',
      label: `Resultado: ${getAuditOutcomeLabel(filters.outcome)}`,
    })
  }

  if (filters.resourceType) {
    chips.push({
      key: 'resourceType',
      label: `Tipo recurso: ${filters.resourceType}`,
    })
  }

  if (filters.resourceId) {
    chips.push({
      key: 'resourceId',
      label: `ID recurso: ${filters.resourceId}`,
    })
  }

  const periodLabel = formatDateRangeLabel(filters.from, filters.to)
  if (periodLabel) {
    chips.push({
      key: 'from',
      label: `Período: ${periodLabel}`,
    })
  }

  return chips
}

export default function AuditActiveFilterChips({
  filters,
  onRemove,
}: AuditActiveFilterChipsProps) {
  const chips = getActiveAuditFilterChips(filters)

  if (chips.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={`${chip.key}-${chip.label}`}
          type="button"
          onClick={() => {
            if (chip.key === 'from') {
              onRemove('from')
              onRemove('to')
              return
            }

            onRemove(chip.key)
          }}
          className={clsx(
            'inline-flex items-center gap-1 rounded-full border border-vscode-border bg-vscode-input-bg px-2.5 py-1 text-xs text-vscode-text',
            'transition-colors hover:bg-vscode-activity-bar',
          )}
        >
          <span>{chip.label}</span>
          <span aria-hidden="true" className="text-vscode-text-muted">
            ×
          </span>
        </button>
      ))}
    </div>
  )
}
