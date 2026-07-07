import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { listRoleCatalog, updateUserAuthentication } from '@/features/user/user-permissions-api'
import {
  areSameIdCollections,
  buildPermissionSelectionFromUser,
  findAdminRuleIds,
  isAdminRuleName,
  sortIds,
} from '@/features/user/user-permissions-mapper'
import type { ManagedUser } from '@/features/user/user-list-types'
import type { UserRuleOption } from '@/features/user/user-permissions-types'
import { queryKeys } from '@/lib/query-keys'

const USERS_FETCH_LIMIT = 100

export function useUserPermissionsEditState(user: ManagedUser | undefined) {
  const queryClient = useQueryClient()
  const userId = user?.id ?? 0

  const [selectedRuleIds, setSelectedRuleIds] = useState<number[]>([])
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([])
  const [initialRuleIds, setInitialRuleIds] = useState<number[]>([])
  const [initialPermissionIds, setInitialPermissionIds] = useState<number[]>([])
  const [expandedRuleIds, setExpandedRuleIds] = useState<number[]>([])
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const catalogQuery = useQuery({
    queryKey: queryKeys.user.roleCatalog,
    queryFn: listRoleCatalog,
    enabled: Boolean(user),
    staleTime: 60_000,
  })

  const catalog = catalogQuery.data ?? []

  const adminRuleIds = useMemo(() => findAdminRuleIds(catalog), [catalog])
  const adminRuleIdSet = useMemo(() => new Set(adminRuleIds), [adminRuleIds])

  const hydrateSelection = useCallback(
    (targetUser: ManagedUser, targetCatalog: UserRuleOption[]) => {
      const selection = buildPermissionSelectionFromUser(targetUser, targetCatalog)
      const ruleIds = sortIds(selection.ruleIds)
      const permissionIds = sortIds(selection.permissionIds)

      setSelectedRuleIds(ruleIds)
      setSelectedPermissionIds(permissionIds)
      setInitialRuleIds(ruleIds)
      setInitialPermissionIds(permissionIds)
      setExpandedRuleIds([])
      setSaveSuccess(false)
      setSaveError(null)
    },
    [],
  )

  useEffect(() => {
    if (!user || !catalogQuery.data?.length) {
      return
    }

    hydrateSelection(user, catalogQuery.data)
  }, [user?.id, catalogQuery.dataUpdatedAt, user, catalogQuery.data, hydrateSelection])

  const isDirty = useMemo(
    () =>
      !areSameIdCollections(selectedRuleIds, initialRuleIds) ||
      !areSameIdCollections(selectedPermissionIds, initialPermissionIds),
    [selectedRuleIds, initialRuleIds, selectedPermissionIds, initialPermissionIds],
  )

  const hasSelectedAdminRule = useMemo(
    () => selectedRuleIds.some((ruleId) => adminRuleIdSet.has(ruleId)),
    [selectedRuleIds, adminRuleIdSet],
  )

  const hasSavedAdminRule = useMemo(
    () => initialRuleIds.some((ruleId) => adminRuleIdSet.has(ruleId)),
    [initialRuleIds, adminRuleIdSet],
  )

  const isAdminLockActive = hasSavedAdminRule || hasSelectedAdminRule

  const toggleAccordion = useCallback(
    (ruleId: number) => {
      const selectedRule = catalog.find((rule) => rule.id === ruleId)

      if (!selectedRule || selectedRule.permissoes.length === 0) {
        return
      }

      setExpandedRuleIds((current) =>
        current.includes(ruleId) ? current.filter((id) => id !== ruleId) : [...current, ruleId],
      )
    },
    [catalog],
  )

  const toggleRule = useCallback(
    (rule: UserRuleOption, checked: boolean) => {
      setSaveSuccess(false)
      setSaveError(null)

      const isAdminRule = adminRuleIdSet.has(rule.id)

      if (checked && !isAdminRule && isAdminLockActive) {
        return
      }

      if (checked) {
        if (isAdminRule) {
          setSelectedRuleIds([rule.id])
          setSelectedPermissionIds(
            sortIds(rule.permissoes.map((permission) => permission.id)),
          )
          return
        }

        setSelectedRuleIds((current) => sortIds([...current, rule.id]))
        return
      }

      const permissionIds = new Set(rule.permissoes.map((permission) => permission.id))

      setSelectedRuleIds((current) => current.filter((id) => id !== rule.id))
      setSelectedPermissionIds((current) =>
        current.filter((permissionId) => !permissionIds.has(permissionId)),
      )
    },
    [adminRuleIdSet, isAdminLockActive],
  )

  const togglePermission = useCallback(
    (ruleId: number, permissionId: number, checked: boolean) => {
      setSaveSuccess(false)
      setSaveError(null)

      const isAdminTargetRule = adminRuleIdSet.has(ruleId)

      if (checked && !isAdminTargetRule && isAdminLockActive) {
        return
      }

      if (checked) {
        if (isAdminTargetRule) {
          setSelectedRuleIds([ruleId])
          setSelectedPermissionIds([permissionId])
          return
        }

        setSelectedRuleIds((current) => sortIds([...current, ruleId]))
        setSelectedPermissionIds((current) => sortIds([...current, permissionId]))
        return
      }

      setSelectedPermissionIds((current) => current.filter((id) => id !== permissionId))
    },
    [adminRuleIdSet, isAdminLockActive],
  )

  const resetSelection = useCallback(() => {
    setSelectedRuleIds(sortIds(initialRuleIds))
    setSelectedPermissionIds(sortIds(initialPermissionIds))
    setSaveSuccess(false)
    setSaveError(null)
  }, [initialRuleIds, initialPermissionIds])

  const saveMutation = useMutation({
    mutationFn: () => {
      const hasAdminOnly = selectedRuleIds.some((ruleId) => adminRuleIdSet.has(ruleId))

      return updateUserAuthentication(userId, {
        regras: sortIds(selectedRuleIds),
        permissoes: hasAdminOnly ? [] : sortIds(selectedPermissionIds),
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.user.detail(userId) })
      await queryClient.invalidateQueries({
        queryKey: queryKeys.user.list({ limit: USERS_FETCH_LIMIT }),
      })

      const savedRuleIds = sortIds(selectedRuleIds)
      const savedPermissionIds = selectedRuleIds.some((ruleId) => adminRuleIdSet.has(ruleId))
        ? []
        : sortIds(selectedPermissionIds)

      setInitialRuleIds(savedRuleIds)
      setInitialPermissionIds(savedPermissionIds)
      setSelectedRuleIds(savedRuleIds)
      setSelectedPermissionIds(savedPermissionIds)
      setSaveSuccess(true)
      setSaveError(null)
    },
    onError: (error) => {
      setSaveSuccess(false)
      setSaveError(error instanceof Error ? error.message : 'Não foi possível salvar as permissões.')
    },
  })

  const saveSelection = useCallback(async () => {
    await saveMutation.mutateAsync()
  }, [saveMutation])

  const refreshCatalog = useCallback(async () => {
    await catalogQuery.refetch()
  }, [catalogQuery])

  return {
    catalog,
    selectedRuleIds,
    selectedPermissionIds,
    initialRuleIds,
    initialPermissionIds,
    expandedRuleIds,
    isDirty,
    isAdminLockActive,
    isAdminRuleName,
    saveSuccess,
    saveError,
    isLoading: catalogQuery.isLoading,
    isError: catalogQuery.isError,
    error: catalogQuery.error,
    isSaving: saveMutation.isPending,
    toggleAccordion,
    toggleRule,
    togglePermission,
    resetSelection,
    saveSelection,
    refreshCatalog,
    canEdit: catalogQuery.isSuccess,
  }
}
