export const GRID_IDS = {
  myDashboards: 'my-dashboards',
  myReports: 'my-reports',
  manageUsers: 'manage-users',
  manageDashboards: 'manage-dashboards',
  manageReports: 'manage-reports',
  manageConnections: 'manage-connections',
  auditLogs: 'audit-logs',
  adminJobs: 'admin-jobs',
  adminScheduleExecutions: 'admin-schedule-executions',
  reportExecution: 'report-execution',
  reportSnapshotHistory: 'report-snapshot-history',
} as const

export type GridId = (typeof GRID_IDS)[keyof typeof GRID_IDS]

export type DataGridLayoutFeatures = {
  enableColumnReorder: boolean
  enableColumnResize: boolean
}

export type GridRegistryEntry = DataGridLayoutFeatures & {
  persistLayout: boolean
}

export const GRID_REGISTRY: Record<GridId, GridRegistryEntry> = {
  [GRID_IDS.myDashboards]: {
    enableColumnReorder: false,
    enableColumnResize: false,
    persistLayout: false,
  },
  [GRID_IDS.myReports]: {
    enableColumnReorder: false,
    enableColumnResize: false,
    persistLayout: false,
  },
  [GRID_IDS.manageUsers]: {
    enableColumnReorder: false,
    enableColumnResize: false,
    persistLayout: false,
  },
  [GRID_IDS.manageDashboards]: {
    enableColumnReorder: false,
    enableColumnResize: false,
    persistLayout: false,
  },
  [GRID_IDS.manageReports]: {
    enableColumnReorder: false,
    enableColumnResize: false,
    persistLayout: false,
  },
  [GRID_IDS.manageConnections]: {
    enableColumnReorder: false,
    enableColumnResize: false,
    persistLayout: false,
  },
  [GRID_IDS.auditLogs]: {
    enableColumnReorder: false,
    enableColumnResize: false,
    persistLayout: true,
  },
  [GRID_IDS.adminJobs]: {
    enableColumnReorder: false,
    enableColumnResize: true,
    persistLayout: true,
  },
  [GRID_IDS.adminScheduleExecutions]: {
    enableColumnReorder: false,
    enableColumnResize: true,
    persistLayout: true,
  },
  [GRID_IDS.reportExecution]: {
    enableColumnReorder: true,
    enableColumnResize: true,
    persistLayout: true,
  },
  [GRID_IDS.reportSnapshotHistory]: {
    enableColumnReorder: true,
    enableColumnResize: true,
    persistLayout: true,
  },
}

export function getGridLayoutFeatures(gridId: GridId): DataGridLayoutFeatures {
  const entry = GRID_REGISTRY[gridId]
  return {
    enableColumnReorder: entry.enableColumnReorder,
    enableColumnResize: entry.enableColumnResize,
  }
}

export function shouldPersistGridLayout(gridId: GridId): boolean {
  return GRID_REGISTRY[gridId].persistLayout
}
