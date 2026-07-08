import {
  mapManagedUserFromApi,
  mapManagedUserListFromApi,
  mapUserDraftToUpdateApi,
} from '@/features/user/user-mapper'
import type { CreateUserInput } from '@/features/user/user-create-types'
import type { UserSummaryOption } from '@/features/user/user-create-types'
import type { ManagedUser, ManagedUserApiRecord } from '@/features/user/user-list-types'
import type { UpdateUserInput } from '@/features/user/user-edit-types'
import { apiRequest, apiRequestWithResponse } from '@/lib/api-client'
import type {
  AccessUser,
  DashboardAccessLists,
  DashboardAccessListsApiRecord,
  UserDetail,
} from './user-types'

export type ListUsersParams = {
  page?: number
  limit?: number
  filter?: string
  bloqueado?: boolean
  regra?: string
  permissao?: string
}

export type ListUsersResult = {
  items: ManagedUser[]
  totalCount: number
}

function buildUsersQuery(params: ListUsersParams): string {
  const searchParams = new URLSearchParams()

  searchParams.set('page', String(params.page ?? 1))
  searchParams.set('limit', String(params.limit ?? 100))

  if (params.filter) {
    searchParams.set('filter', params.filter)
  }

  if (params.bloqueado !== undefined) {
    searchParams.set('bloqueado', String(params.bloqueado))
  }

  if (params.regra) {
    searchParams.set('regra', params.regra)
  }

  if (params.permissao) {
    searchParams.set('permissao', params.permissao)
  }

  return searchParams.toString()
}

function parseTotalCount(headerValue: string | null): number {
  if (!headerValue) {
    return 0
  }

  const parsed = Number(headerValue)
  return Number.isFinite(parsed) ? parsed : 0
}

export async function listUsers(params: ListUsersParams = {}): Promise<ListUsersResult> {
  const query = buildUsersQuery(params)
  const { data, response } = await apiRequestWithResponse<ManagedUserApiRecord[]>(
    `/user?${query}`,
  )

  return {
    items: mapManagedUserListFromApi(data),
    totalCount: parseTotalCount(response.headers.get('x-total-count')),
  }
}

function mapAccessUserFromApi(record: {
  id: number | string
  nome: string
  sobrenome: string
  foto?: {
    id: number | string
    nome?: string
    local?: string
    tipo?: string
    type?: string
    url?: string
  } | null
}): AccessUser {
  return {
    id: Number(record.id),
    nome: record.nome,
    sobrenome: record.sobrenome,
    foto: record.foto
      ? {
          id: Number(record.foto.id),
          nome: record.foto.nome,
          local: record.foto.local,
          type: record.foto.type ?? record.foto.tipo,
        }
      : null,
  }
}

function mapDashboardAccessListsFromApi(
  record: DashboardAccessListsApiRecord,
): DashboardAccessLists {
  return {
    usuarios: record.usuarios.map(mapAccessUserFromApi),
    usuariosDisponiveis: record.usuariosDisponiveis.map(mapAccessUserFromApi),
  }
}

export async function getManagedUserById(id: number): Promise<ManagedUser> {
  const data = await apiRequest<ManagedUserApiRecord>(`/user/${id}`, { method: 'GET' })
  return mapManagedUserFromApi(data)
}

export async function deleteUser(id: number): Promise<void> {
  await apiRequest<void>(`/user/${id}`, { method: 'DELETE' })
}

export async function updateUser(id: number, input: UpdateUserInput): Promise<ManagedUser> {
  const data = await apiRequest<ManagedUserApiRecord>(`/user/${id}`, {
    method: 'PATCH',
    body: mapUserDraftToUpdateApi(input),
  })

  return mapManagedUserFromApi(data)
}

export async function updateUserPhoto(id: number, photo: Blob): Promise<ManagedUser> {
  const formData = new FormData()
  formData.append('foto', photo, 'usuario-foto.webp')

  const data = await apiRequest<ManagedUserApiRecord>(`/user/${id}`, {
    method: 'PATCH',
    body: formData,
  })

  return mapManagedUserFromApi(data)
}

export async function deleteUserPhoto(id: number): Promise<void> {
  await apiRequest<void>(`/user/photo/${id}`, { method: 'DELETE' })
}

export async function getUserById(id: number): Promise<UserDetail> {
  return apiRequest<UserDetail>(`/user/${id}`, { method: 'GET' })
}

export async function getUsersByDashboard(dashboardId: number): Promise<DashboardAccessLists> {
  const data = await apiRequest<DashboardAccessListsApiRecord>(
    `/user/dashboards/${dashboardId}`,
  )

  return mapDashboardAccessListsFromApi(data)
}

export async function listUserIds(): Promise<UserSummaryOption[]> {
  const data = await apiRequest<{ id: number | string; nome: string }[]>('/user/ids', {
    method: 'GET',
  })

  return data.map((record) => ({
    id: Number(record.id),
    nome: record.nome,
  }))
}

export async function createUser(input: CreateUserInput): Promise<ManagedUser> {
  const formData = new FormData()
  formData.append('nome', input.nome)
  formData.append('sobrenome', input.sobrenome)
  formData.append('email', input.email)
  formData.append('senha', input.senha)

  if (input.photo) {
    formData.append('foto', input.photo, 'usuario-foto.webp')
  }

  const data = await apiRequest<ManagedUserApiRecord>('/user/', {
    method: 'POST',
    body: formData,
  })

  return mapManagedUserFromApi(data)
}

export async function copyUserAuthentication(
  idUsuario: number,
  idCopiado: number,
): Promise<void> {
  await apiRequest<void>('/user/copy/authentication', {
    method: 'PATCH',
    body: { id_usuario: idUsuario, id_copiado: idCopiado },
  })
}

export async function copyUserDashboards(idUsuario: number, idCopiado: number): Promise<void> {
  await apiRequest<void>('/user/copy/dashboards', {
    method: 'PATCH',
    body: { id_usuario: idUsuario, id_copiado: idCopiado },
  })
}

export async function copyUserRelatorios(idUsuario: number, idCopiado: number): Promise<void> {
  await apiRequest<void>('/user/copy/relatorios', {
    method: 'PATCH',
    body: { id_usuario: idUsuario, id_copiado: idCopiado },
  })
}
