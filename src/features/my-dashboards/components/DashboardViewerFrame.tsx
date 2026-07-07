import { useEffect, useRef } from 'react'
import Alert from '@/components/ui/Alert'
import { buildDashboardPreviewUrl } from '@/features/dashboards/build-dashboard-preview-url'

type DashboardViewerFrameProps = {
  dashboardName: string
  url: string
  query?: string | null
}

export default function DashboardViewerFrame({
  dashboardName,
  url,
  query,
}: DashboardViewerFrameProps) {
  const previewUrl = buildDashboardPreviewUrl(url, query)
  const blockNextAutoFullscreen = useRef(true)

  useEffect(() => {
    blockNextAutoFullscreen.current = true

    const onFullscreenChange = () => {
      if (document.fullscreenElement && blockNextAutoFullscreen.current) {
        blockNextAutoFullscreen.current = false
        void document.exitFullscreen()
      }
    }

    document.addEventListener('fullscreenchange', onFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange)
    }
  }, [previewUrl])

  if (!previewUrl) {
    return (
      <Alert variant="info">
        Este dashboard não possui URL configurada para visualização.
      </Alert>
    )
  }

  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-vscode-border bg-vscode-sidebar">
      <iframe
        key={previewUrl}
        title={`Visualização: ${dashboardName}`}
        src={previewUrl}
        loading="lazy"
        referrerPolicy="no-referrer"
        allow="fullscreen"
        allowFullScreen
        onLoad={() => {
          blockNextAutoFullscreen.current = true
        }}
        className="block h-full min-h-0 w-full flex-1 border-0 bg-[#0b1220]"
      />
    </article>
  )
}
