import type { ListMyReportsParams } from '@/features/my-reports/my-report-types'
import type { MyReportFilters } from '@/features/my-reports/my-report-types'

export const MY_REPORTS_PAGE_SIZE = 50

export const DEFAULT_MY_REPORT_FILTERS: MyReportFilters = {
  favoritos: false,
  privacidade: 'all',
  temporario: 'all',
}

export function areMyReportFiltersEqual(a: MyReportFilters, b: MyReportFilters): boolean {
  return (
    a.favoritos === b.favoritos &&
    a.privacidade === b.privacidade &&
    a.temporario === b.temporario
  )
}

export function hasActiveMyReportFilters(filters: MyReportFilters): boolean {
  return !areMyReportFiltersEqual(filters, DEFAULT_MY_REPORT_FILTERS)
}

export function hasActiveMyReportDialogFilters(filters: MyReportFilters): boolean {
  return filters.privacidade !== 'all' || filters.temporario !== 'all'
}

export function buildMyReportListParams(
  search: string,
  filters: MyReportFilters,
  page: number,
  limit = MY_REPORTS_PAGE_SIZE,
): ListMyReportsParams {
  const params: ListMyReportsParams = {
    page,
    limit,
  }

  const normalizedSearch = search.trim()
  if (normalizedSearch) {
    params.nome = normalizedSearch
  }

  if (filters.favoritos) {
    params.favoritos = true
  }

  if (filters.privacidade !== 'all') {
    params.privacidade = filters.privacidade
  }

  if (filters.temporario !== 'all') {
    params.temporario = filters.temporario
  }

  return params
}
