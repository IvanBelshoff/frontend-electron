import type { Report, ReportFilters } from '@/features/reports/report-types'

export const DEFAULT_REPORT_FILTERS: ReportFilters = {
  privacidade: 'all',
  visivel: 'all',
  temporario: 'all',
  estado: 'all',
}

export function areReportFiltersEqual(a: ReportFilters, b: ReportFilters): boolean {
  return (
    a.privacidade === b.privacidade &&
    a.visivel === b.visivel &&
    a.temporario === b.temporario &&
    a.estado === b.estado
  )
}

export function hasActiveReportFilters(filters: ReportFilters): boolean {
  return !areReportFiltersEqual(filters, DEFAULT_REPORT_FILTERS)
}

export function applyReportFilters(
  reports: Report[],
  search: string,
  filters: ReportFilters,
): Report[] {
  const normalizedSearch = search.trim().toLowerCase()

  return reports.filter((report) => {
    if (normalizedSearch && !report.nome.toLowerCase().includes(normalizedSearch)) {
      return false
    }

    if (filters.privacidade !== 'all' && report.privacidade !== filters.privacidade) {
      return false
    }

    if (filters.visivel !== 'all' && report.visivel !== filters.visivel) {
      return false
    }

    if (filters.temporario !== 'all' && report.temporario !== filters.temporario) {
      return false
    }

    if (filters.estado !== 'all' && report.estado !== filters.estado) {
      return false
    }

    return true
  })
}
