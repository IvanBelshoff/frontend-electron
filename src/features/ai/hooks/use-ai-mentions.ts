import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { listAiMentionRelatorios } from '@/features/ai/ai-chat-api'
import type {
  AiMention,
  AiMentionCategory,
  AiMentionCategoryId,
  AiMentionListItem,
} from '@/features/ai/ai-mention-types'
import { mentionKey } from '@/features/ai/ai-mention-types'
import { useAuth } from '@/features/auth/use-auth'
import { hasRole } from '@/features/auth/rbac'
import {
  DASHBOARD_RBAC,
  RBAC_ROLES,
  USER_RBAC,
} from '@/features/auth/rbac-requirements'
import { listMyDashboards } from '@/features/my-dashboards/my-dashboard-api'
import { listUsers } from '@/features/user/user-api'
import { queryKeys } from '@/lib/query-keys'

function matchesFilter(label: string, filter: string): boolean {
  const normalized = filter.trim().toLowerCase()
  if (!normalized) {
    return true
  }
  return label.toLowerCase().includes(normalized)
}

export function useAiMentions(selected: AiMention[]) {
  const { rbac, user } = useAuth()
  const userId = user?.sub ?? null
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'categories' | 'items'>('categories')
  const [activeCategory, setActiveCategory] = useState<AiMentionCategoryId | null>(
    null,
  )
  const [filter, setFilter] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const canMentionUsers =
    hasRole(rbac, USER_RBAC.menuRole) || hasRole(rbac, RBAC_ROLES.ADMIN)

  const dashboardsQuery = useQuery({
    queryKey: queryKeys.myDashboards.list({ page: 1, limit: 1 }),
    queryFn: () => listMyDashboards({ page: 1, limit: 1 }),
    enabled: open,
  })

  const canMentionDashboards =
    hasRole(rbac, DASHBOARD_RBAC.menuRole) ||
    hasRole(rbac, RBAC_ROLES.ADMIN) ||
    (dashboardsQuery.data?.totalCount ?? 0) > 0

  const categories = useMemo<AiMentionCategory[]>(() => {
    const next: AiMentionCategory[] = [
      {
        id: 'relatorios',
        label: 'Relatórios',
        domainMention: {
          type: 'dominio_relatorios',
          label: 'Relatórios',
        },
      },
    ]

    if (canMentionDashboards) {
      next.push({
        id: 'dashboards',
        label: 'Dashboards',
        domainMention: {
          type: 'dominio_dashboards',
          label: 'Dashboards',
        },
      })
    }

    if (canMentionUsers) {
      next.push({
        id: 'usuarios',
        label: 'Usuários',
        domainMention: {
          type: 'dominio_usuarios',
          label: 'Usuários',
        },
      })
    }

    return next.filter((category) => matchesFilter(category.label, filter))
  }, [canMentionDashboards, canMentionUsers, filter])

  const relatoriosQuery = useQuery({
    queryKey: queryKeys.ai.mentionRelatorios(userId),
    queryFn: listAiMentionRelatorios,
    enabled: Boolean(userId) && open && mode === 'items' && activeCategory === 'relatorios',
  })

  const dashboardsListQuery = useQuery({
    queryKey: queryKeys.myDashboards.list({ page: 1, limit: 100 }),
    queryFn: () => listMyDashboards({ page: 1, limit: 100 }),
    enabled: open && mode === 'items' && activeCategory === 'dashboards',
  })

  const usersQuery = useQuery({
    queryKey: queryKeys.user.list({ limit: 100 }),
    queryFn: () => listUsers({ limit: 100 }),
    enabled: open && mode === 'items' && activeCategory === 'usuarios' && canMentionUsers,
  })

  const items = useMemo<AiMentionListItem[]>(() => {
    if (activeCategory === 'relatorios') {
      return (relatoriosQuery.data ?? [])
        .map((report) => ({
          id: report.id,
          label: report.nome,
          mention: {
            type: 'relatorio' as const,
            id: report.id,
            label: report.nome,
          },
        }))
        .filter((item) => matchesFilter(item.label, filter))
    }

    if (activeCategory === 'dashboards') {
      return (dashboardsListQuery.data?.items ?? [])
        .map((dashboard) => ({
          id: dashboard.id,
          label: dashboard.nome,
          mention: {
            type: 'dashboard' as const,
            id: dashboard.id,
            label: dashboard.nome,
          },
        }))
        .filter((item) => matchesFilter(item.label, filter))
    }

    if (activeCategory === 'usuarios') {
      return (usersQuery.data?.items ?? [])
        .map((user) => {
          const label = `${user.nome} ${user.sobrenome}`.trim()
          return {
            id: user.id,
            label,
            mention: {
              type: 'usuario' as const,
              id: user.id,
              label,
            },
          }
        })
        .filter((item) => matchesFilter(item.label, filter))
    }

    return []
  }, [
    activeCategory,
    dashboardsListQuery.data?.items,
    filter,
    relatoriosQuery.data,
    usersQuery.data?.items,
  ])

  const selectedKeys = useMemo(
    () => new Set(selected.map((mention) => mentionKey(mention))),
    [selected],
  )

  const selectableItems = useMemo(
    () => items.filter((item) => !selectedKeys.has(mentionKey(item.mention))),
    [items, selectedKeys],
  )

  const isLoading =
    (activeCategory === 'relatorios' && relatoriosQuery.isLoading) ||
    (activeCategory === 'dashboards' && dashboardsListQuery.isLoading) ||
    (activeCategory === 'usuarios' && usersQuery.isLoading)

  function openPopup() {
    setOpen(true)
    setMode('categories')
    setActiveCategory(null)
    setFilter('')
    setActiveIndex(0)
  }

  function closePopup() {
    setOpen(false)
    setMode('categories')
    setActiveCategory(null)
    setFilter('')
    setActiveIndex(0)
  }

  function detectAtQuery(
    value: string,
    cursor: number,
  ): { active: boolean; query: string } {
    if (cursor < 1) {
      return { active: false, query: '' }
    }

    const before = value.slice(0, cursor)
    const match = before.match(/(^|[\s])@([\wÀ-ÿ-]*)$/u)
    if (!match) {
      return { active: false, query: '' }
    }

    return { active: true, query: match[2] ?? '' }
  }

  function handleInputChange(value: string, cursor: number) {
    const detected = detectAtQuery(value, cursor)
    if (detected.active) {
      if (!open) {
        openPopup()
      }
      setFilter(detected.query)
      setActiveIndex(0)
      return
    }

    if (open) {
      closePopup()
    }
  }

  function selectCategory(category: AiMentionCategory) {
    setActiveCategory(category.id)
    setMode('items')
    setFilter('')
    setActiveIndex(0)
  }

  function goBack() {
    setMode('categories')
    setActiveCategory(null)
    setFilter('')
    setActiveIndex(0)
  }

  function rowCount() {
    return mode === 'categories' ? categories.length : selectableItems.length
  }

  function moveActive(delta: number) {
    const count = rowCount()
    if (count === 0) {
      return
    }
    setActiveIndex((current) => (current + delta + count) % count)
  }

  return {
    open,
    mode,
    filter,
    setFilter: (value: string) => {
      setFilter(value)
      setActiveIndex(0)
    },
    categories,
    items: selectableItems,
    activeIndex,
    isLoading,
    openPopup,
    closePopup,
    handleInputChange,
    selectCategory,
    goBack,
    moveActive,
    setActiveIndex,
    getActiveCategory: () =>
      categories.find((category) => category.id === activeCategory) ?? null,
  }
}
