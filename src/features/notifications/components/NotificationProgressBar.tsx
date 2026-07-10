import { useEffect, useState } from 'react'
import clsx from 'clsx'

type NotificationProgressBarProps = {
  durationMs: number
  paused: boolean
  progressKey: number
  onComplete: () => void
  className?: string
}

export default function NotificationProgressBar({
  durationMs,
  paused,
  progressKey,
  onComplete,
  className,
}: NotificationProgressBarProps) {
  const [started, setStarted] = useState(false)

  useEffect(() => {
    setStarted(false)
    const frame = window.requestAnimationFrame(() => setStarted(true))
    return () => window.cancelAnimationFrame(frame)
  }, [progressKey, durationMs])

  return (
    <div className={clsx('h-1 w-full overflow-hidden bg-vscode-border/60', className)}>
      <div
        key={`${progressKey}-${durationMs}`}
        className="h-full bg-vscode-accent"
        style={{
          width: started && !paused ? '0%' : '100%',
          transition:
            started && !paused
              ? `width ${durationMs}ms linear`
              : 'none',
        }}
        onTransitionEnd={(event) => {
          if (event.propertyName === 'width' && started && !paused) {
            onComplete()
          }
        }}
      />
    </div>
  )
}
