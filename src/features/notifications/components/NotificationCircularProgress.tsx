import { useEffect, useState } from 'react'
import clsx from 'clsx'

type NotificationCircularProgressProps = {
  durationMs: number
  paused: boolean
  progressKey: number
  onComplete: () => void
}

const SIZE = 36
const STROKE = 3
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function NotificationCircularProgress({
  durationMs,
  paused,
  progressKey,
  onComplete,
}: NotificationCircularProgressProps) {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    setOffset(0)
    if (paused) {
      return
    }

    const frame = window.requestAnimationFrame(() => {
      setOffset(CIRCUMFERENCE)
    })

    const timeout = window.setTimeout(() => {
      onComplete()
    }, durationMs)

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timeout)
    }
  }, [durationMs, paused, progressKey, onComplete])

  return (
    <svg width={SIZE} height={SIZE} className="-rotate-90 shrink-0" aria-hidden="true">
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.15}
        strokeWidth={STROKE}
        className="text-vscode-accent"
      />
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
        className="text-vscode-accent"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        style={{
          transition: paused ? 'none' : `stroke-dashoffset ${durationMs}ms linear`,
        }}
      />
    </svg>
  )
}
