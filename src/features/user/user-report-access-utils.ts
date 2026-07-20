import type { AccessReport } from '@/features/user/user-report-access-types'

export function sortAccessReports(reports: AccessReport[]): AccessReport[] {
  return [...reports].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

export function filterAccessReportsBySearch(
  reports: AccessReport[],
  search: string,
): AccessReport[] {
  const normalizedSearch = search.trim().toLowerCase()

  if (!normalizedSearch) {
    return reports
  }

  return reports.filter((report) => report.nome.toLowerCase().includes(normalizedSearch))
}

export function isOwnerReport(report: AccessReport, userId: number): boolean {
  if (report.idProprietario == null) {
    return false
  }

  return Number(report.idProprietario) === Number(userId)
}

export function countSelectableGrantedReports(
  reports: AccessReport[],
  userId: number,
): number {
  return reports.filter((report) => !isOwnerReport(report, userId)).length
}
