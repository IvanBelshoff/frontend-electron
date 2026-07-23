import { useEffect, useState, type RefObject } from 'react'

export function useDataGridContainerWidth(containerRef: RefObject<HTMLElement | null>): number {
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const element = containerRef.current
    if (!element) {
      return
    }

    const updateWidth = () => {
      setContainerWidth(element.clientWidth)
    }

    updateWidth()

    const observer = new ResizeObserver(updateWidth)
    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [containerRef])

  return containerWidth
}
