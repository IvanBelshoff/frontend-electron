import DashboardViewerFrame from '@/features/my-dashboards/components/DashboardViewerFrame'

type DashboardPreviewTabProps = {
  dashboardName: string
  url: string
  query?: string | null
}

export default function DashboardPreviewTab({
  dashboardName,
  url,
  query,
}: DashboardPreviewTabProps) {
  return (
    <DashboardViewerFrame dashboardName={dashboardName} url={url} query={query} />
  )
}
