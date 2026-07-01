import { apiRequest } from '@/lib/api-client'
import type {
  AccessUser,
  DashboardAccessLists,
  DashboardAccessListsApiRecord,
  UserDetail,
} from './user-types'

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

export async function getUserById(id: number): Promise<UserDetail> {
  return apiRequest<UserDetail>(`/user/${id}`, { method: 'GET' })
}

export async function getUsersByDashboard(dashboardId: number): Promise<DashboardAccessLists> {
  const data = await apiRequest<DashboardAccessListsApiRecord>(
    `/user/dashboards/${dashboardId}`,
  )

  return mapDashboardAccessListsFromApi(data)
}
