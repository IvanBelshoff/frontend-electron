import {
  Background,
  BackgroundVariant,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import '@xyflow/react/dist/style.css'
import { buildUserAccessFlowGraph } from '@/features/user/build-user-access-flow-graph'
import { hasUserAccessData } from '@/features/user/has-user-access-data'
import type { ManagedUser } from '@/features/user/user-list-types'
import '@/features/user/user-access-flow.css'

type UserAccessFlowProps = {
  user: ManagedUser
}

const FIT_VIEW_OPTIONS = {
  padding: 0.14,
  minZoom: 0.15,
  maxZoom: 1.15,
  duration: 0,
}

function FitViewOnResize({ trigger }: { trigger: unknown }) {
  const { fitView } = useReactFlow()

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void fitView(FIT_VIEW_OPTIONS)
    })

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [fitView, trigger])

  return null
}

type UserAccessFlowCanvasProps = {
  user: ManagedUser
  graph: ReturnType<typeof buildUserAccessFlowGraph>
  flowCanvasWidth: number
}

function UserAccessFlowCanvas({ user, graph, flowCanvasWidth }: UserAccessFlowCanvasProps) {
  return (
    <ReactFlow
      nodes={graph.nodes}
      edges={graph.edges}
      fitView
      fitViewOptions={FIT_VIEW_OPTIONS}
      onInit={(instance) => {
        void instance.fitView(FIT_VIEW_OPTIONS)
      }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnDrag={false}
      zoomOnDoubleClick={false}
      zoomOnPinch={false}
      zoomOnScroll={false}
      preventScrolling={false}
      proOptions={{ hideAttribution: true }}
    >
      <FitViewOnResize trigger={`${user.id}-${flowCanvasWidth}-${graph.nodes.length}-${graph.edges.length}`} />
      <Background
        variant={BackgroundVariant.Dots}
        gap={20}
        size={1.2}
        color="rgba(148, 163, 184, 0.24)"
      />
    </ReactFlow>
  )
}

export default function UserAccessFlow({ user }: UserAccessFlowProps) {
  const hasAccessData = hasUserAccessData(user)

  const flowCanvasRef = useRef<HTMLDivElement | null>(null)
  const [flowCanvasWidth, setFlowCanvasWidth] = useState(0)

  useEffect(() => {
    const element = flowCanvasRef.current

    if (!element) {
      return
    }

    const updateWidth = () => {
      const nextWidth = Math.round(element.getBoundingClientRect().width)
      setFlowCanvasWidth((current) => (current === nextWidth ? current : nextWidth))
    }

    updateWidth()

    const observer = new ResizeObserver(() => {
      updateWidth()
    })

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [])

  const graph = useMemo(() => buildUserAccessFlowGraph(user), [user])

  if (!hasAccessData) {
    return null
  }

  if (graph.nodes.length === 0) {
    return (
      <div className="user-access-flow-empty">
        Sem dados suficientes para montar o fluxo de acesso.
      </div>
    )
  }

  return (
    <div className="user-access-flow-wrap">
      <div className="user-access-flow-title">Mapa de acesso</div>

      <div
        ref={flowCanvasRef}
        className="user-access-flow-canvas"
        style={{ height: `${graph.canvasHeight}px` }}
      >
        {flowCanvasWidth > 0 && (
          <ReactFlowProvider>
            <UserAccessFlowCanvas
              user={user}
              graph={graph}
              flowCanvasWidth={flowCanvasWidth}
            />
          </ReactFlowProvider>
        )}
      </div>
    </div>
  )
}
