import { useCallback, useLayoutEffect, useRef, useState, type ReactNode, type TransitionEvent } from 'react'
import { DATA_GRID_EXPAND_TRANSITION_MS } from '@/components/data-grid/data-grid.constants'

type DataGridExpandPanelProps = {
  expanded: boolean
  onHeightChange?: () => void
  onCollapseEnd?: () => void
  children: ReactNode
}

export default function DataGridExpandPanel({
  expanded,
  onHeightChange,
  onCollapseEnd,
  children,
}: DataGridExpandPanelProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  const measureContentHeight = useCallback(() => {
    return contentRef.current?.scrollHeight ?? 0
  }, [])

  useLayoutEffect(() => {
    if (!contentRef.current) {
      return
    }

    if (expanded) {
      setHeight(0)
      requestAnimationFrame(() => {
        setHeight(measureContentHeight())
        onHeightChange?.()
      })
      return
    }

    setHeight(0)
  }, [expanded, measureContentHeight, onHeightChange])

  useLayoutEffect(() => {
    const element = contentRef.current
    if (!element || !expanded) {
      return
    }

    const observer = new ResizeObserver(() => {
      setHeight(measureContentHeight())
      onHeightChange?.()
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [expanded, measureContentHeight, onHeightChange])

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== 'height') {
      return
    }

    onHeightChange?.()

    if (!expanded) {
      onCollapseEnd?.()
    }
  }

  return (
    <div
      className="overflow-hidden ease-in-out"
      style={{
        height,
        transitionProperty: 'height',
        transitionDuration: `${DATA_GRID_EXPAND_TRANSITION_MS}ms`,
        transitionTimingFunction: 'ease-in-out',
      }}
      onTransitionEnd={handleTransitionEnd}
    >
      <div ref={contentRef} className="px-4 py-3">
        {children}
      </div>
    </div>
  )
}
