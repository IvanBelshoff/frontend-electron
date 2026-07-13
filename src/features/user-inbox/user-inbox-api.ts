import {
  mapUserInboxItemFromApi,
  mapUserProfileSummaryFromApi,
} from '@/features/user-inbox/user-inbox-mapper'
import type { UserInboxListResult } from '@/features/user-inbox/user-inbox-types'
import { mapManagedUserFromApi } from '@/features/user/user-mapper'
import type { ManagedUserApiRecord } from '@/features/user/user-list-types'
import { apiRequest, apiRequestWithResponse } from '@/lib/api-client'

export type ListUserInboxParams = {
  page?: number
  pageSize?: number
  unreadOnly?: boolean
}

function parseTotalCount(headerValue: string | null): number {
  if (!headerValue) {
    return 0
  }

  const parsed = Number(headerValue)
  return Number.isFinite(parsed) ? parsed : 0
}

export async function listUserNotifications(
  params: ListUserInboxParams = {},
): Promise<UserInboxListResult> {
  const searchParams = new URLSearchParams()
  searchParams.set('page', String(params.page ?? 1))
  searchParams.set('page_size', String(params.pageSize ?? 20))

  if (params.unreadOnly) {
    searchParams.set('unread_only', 'true')
  }

  const { data, response } = await apiRequestWithResponse<{
    items: Parameters<typeof mapUserInboxItemFromApi>[0][]
    page: number
    page_size: number
    total: number
  }>(`/user/me/notifications?${searchParams.toString()}`)

  return {
    items: (data.items ?? []).map(mapUserInboxItemFromApi),
    page: data.page ?? params.page ?? 1,
    pageSize: data.page_size ?? params.pageSize ?? 20,
    total: parseTotalCount(response.headers.get('x-total-count')) || data.total || 0,
  }
}

export async function getUnreadNotificationCount(): Promise<number> {
  const data = await apiRequest<{ count: number }>('/user/me/notifications/unread-count')
  return data.count ?? 0
}

export async function markUserNotificationRead(notificationId: string): Promise<void> {
  await apiRequest<void>(`/user/me/notifications/${notificationId}/read`, {
    method: 'PATCH',
  })
}

export async function markAllUserNotificationsRead(): Promise<void> {
  await apiRequest<void>('/user/me/notifications/read-all', {
    method: 'PATCH',
  })
}

export async function getUserProfileSummary() {
  const data = await apiRequest<Parameters<typeof mapUserProfileSummaryFromApi>[0]>(
    '/user/me/summary',
  )
  return mapUserProfileSummaryFromApi(data)
}

export async function uploadMyPhoto(photo: Blob): Promise<void> {
  const formData = new FormData()
  formData.append('foto', photo, 'usuario-foto.webp')

  await apiRequest<ManagedUserApiRecord>('/user/me/photo', {
    method: 'PATCH',
    body: formData,
  })
}

export type ChangeMyPasswordInput = {
  senhaAtual: string
  senha: string
}

export async function changeMyPassword(input: ChangeMyPasswordInput): Promise<void> {
  await apiRequest<void>('/user/me/password', {
    method: 'PATCH',
    body: input,
  })
}
