import { useCallback, useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import DataGrid from '@/components/data-grid/DataGrid'
import { GRID_IDS } from '@/components/data-grid/grid-registry'
import IconButton from '@/components/ui/IconButton'
import UserEmptyState from '@/features/user/components/UserEmptyState'
import UserExpandedDetails from '@/features/user/components/UserExpandedDetails'
import UserStatusBadge from '@/features/user/components/UserStatusBadge'
import { formatUserDate } from '@/features/user/format-user-date'
import type { ManagedUser } from '@/features/user/user-list-types'
import { getUserDisplayName } from '@/features/user/user-list-types'
import UserAvatar from '@/features/user/UserAvatar'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
  TrashIcon,
} from '@/features/dashboards/icons/DashboardIcons'

type UserTableProps = {
  users: ManagedUser[]
  onEdit: (user: ManagedUser) => void
  onDelete: (user: ManagedUser) => void
  onClearFilters: () => void
  canEdit?: boolean
  canDelete?: boolean
}

const VISIBLE_PERMISSIONS = 2

function formatRegrasList(regras: string[]): string {
  if (regras.length === 0) {
    return 'Nenhuma'
  }

  return regras.join(', ')
}

function formatPermissoesList(permissoes: string[]): string {
  if (permissoes.length === 0) {
    return 'Nenhuma'
  }

  if (permissoes.length <= VISIBLE_PERMISSIONS) {
    return permissoes.join(', ')
  }

  const visible = permissoes.slice(0, VISIBLE_PERMISSIONS).join(', ')
  const remaining = permissoes.length - VISIBLE_PERMISSIONS

  return `${visible}, +${remaining}`
}

export default function UserTable({
  users,
  onEdit,
  onDelete,
  onClearFilters,
  canEdit = true,
  canDelete = true,
}: UserTableProps) {
  const [expandedRowIds, setExpandedRowIds] = useState<string[]>([])

  const toggleRowDetails = useCallback((rowId: string) => {
    setExpandedRowIds((current) =>
      current.includes(rowId)
        ? current.filter((id) => id !== rowId)
        : [...current, rowId],
    )
  }, [])

  const columns = useMemo<ColumnDef<ManagedUser>[]>(
    () => [
      {
        id: 'usuario',
        header: 'Usuário',
        accessorFn: (user) => getUserDisplayName(user),
        enableSorting: true,
        cell: ({ row }) => {
          const user = row.original
          const displayName = getUserDisplayName(user)

          return (
            <div className="flex min-w-0 items-center gap-2.5">
              <UserAvatar
                userId={user.id}
                nome={user.nome}
                sobrenome={user.sobrenome}
                foto={user.foto}
                className="h-8 w-8 text-xs"
              />

              <div className="min-w-0">
                <p className="min-w-0 break-words font-medium leading-snug text-vscode-text">
                  {displayName}
                </p>
                <p className="min-w-0 break-words text-xs leading-snug text-vscode-text-muted">
                  {user.email}
                </p>
              </div>
            </div>
          )
        },
      },
      {
        id: 'status',
        header: 'Status',
        accessorKey: 'bloqueado',
        enableSorting: true,
        cell: ({ row }) => <UserStatusBadge bloqueado={row.original.bloqueado} />,
      },
      {
        id: 'ultimoLogin',
        header: 'Último login',
        accessorKey: 'ultimoLogin',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="whitespace-nowrap">{formatUserDate(row.original.ultimoLogin)}</span>
        ),
      },
      {
        id: 'regras',
        header: 'Regras',
        accessorFn: (user) => formatRegrasList(user.regras),
        enableSorting: true,
        cell: ({ row }) => (
          <span className="break-words text-xs text-vscode-text-muted">
            {formatRegrasList(row.original.regras)}
          </span>
        ),
      },
      {
        id: 'permissoes',
        header: 'Permissões',
        accessorFn: (user) => formatPermissoesList(user.permissoes),
        enableSorting: true,
        cell: ({ row }) => (
          <span className="break-words text-xs text-vscode-text-muted">
            {formatPermissoesList(row.original.permissoes)}
          </span>
        ),
      },
      {
        id: 'detalhes',
        header: 'Detalhes',
        enableSorting: false,
        enableResizing: false,
        meta: { stopRowClick: true },
        cell: ({ row }) => {
          const displayName = getUserDisplayName(row.original)
          const isExpanded = expandedRowIds.includes(row.id)

          return (
            <button
              type="button"
              onClick={() => toggleRowDetails(row.id)}
              className="inline-flex items-center gap-1.5 rounded-full border border-vscode-border px-2.5 py-1 text-xs text-vscode-text-muted transition-colors hover:border-vscode-accent/40 hover:bg-vscode-accent/10 hover:text-vscode-text focus:outline-none focus:ring-2 focus:ring-vscode-accent/40"
              aria-label={
                isExpanded
                  ? `Ocultar detalhes de ${displayName}`
                  : `Exibir detalhes de ${displayName}`
              }
            >
              {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
              {isExpanded ? 'Ocultar' : 'Detalhes'}
            </button>
          )
        },
      },
      {
        id: 'acoes',
        header: 'Ações',
        enableSorting: false,
        enableResizing: false,
        meta: { lockPosition: 'end', stopRowClick: true },
        cell: ({ row }) => {
          const user = row.original
          const displayName = getUserDisplayName(user)

          return (
            <div className="flex items-center gap-0.5">
              <IconButton
                icon={<PencilIcon />}
                label={`Editar ${displayName}`}
                title={
                  canEdit
                    ? 'Editar'
                    : 'Você não possui permissão para editar usuários.'
                }
                onClick={() => onEdit(user)}
                disabled={!canEdit}
                className="h-8 w-8 rounded-full border border-vscode-border text-sky-400 hover:border-sky-400/40 hover:bg-sky-400/10 hover:text-sky-300 disabled:opacity-40"
              />
              <IconButton
                icon={<TrashIcon />}
                label={`Excluir ${displayName}`}
                title={
                  canDelete
                    ? 'Excluir'
                    : 'Você não possui permissão para excluir usuários.'
                }
                onClick={() => onDelete(user)}
                disabled={!canDelete}
                className="h-8 w-8 rounded-full border border-vscode-border text-red-400 hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300 disabled:opacity-40"
              />
            </div>
          )
        },
      },
    ],
    [canDelete, canEdit, expandedRowIds, onDelete, onEdit, toggleRowDetails],
  )

  if (users.length === 0) {
    return <UserEmptyState onClearFilters={onClearFilters} />
  }

  return (
    <DataGrid
      gridId={GRID_IDS.manageUsers}
      data={users}
      columns={columns}
      getRowId={(user) => String(user.id)}
      enableSorting
      sortingMode="client"
      renderSubRow={(user) => <UserExpandedDetails user={user} />}
      expandedRowIds={expandedRowIds}
    />
  )
}
