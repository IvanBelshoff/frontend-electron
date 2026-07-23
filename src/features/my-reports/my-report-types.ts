import type { Privacidade } from '@/features/dashboards/dashboard-types'
import type { Report } from '@/features/reports/report-types'

export type MyReportViewMode = 'grid' | 'table'

export type MyReportFilters = {
  favoritos: boolean
  privacidade: 'all' | Privacidade
  temporario: 'all' | boolean
}

export type MyReportListResult = {
  items: Report[]
  favoriteIds: number[]
  totalCount: number
}

export type ListMyReportsParams = {
  page?: number
  limit?: number
  nome?: string
  favoritos?: boolean
  privacidade?: Privacidade
  temporario?: boolean
  sort?: string
}
