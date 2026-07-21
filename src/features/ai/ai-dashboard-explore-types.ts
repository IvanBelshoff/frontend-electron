export type AiDashboardExploreMapa = {
  abas: string[]
  filtros: Array<{
    nome: string
    valores?: string[]
    valoresAmostra?: string[]
  }>
  destaquesCapa: string[]
  geradoEm: string
}

export type AiDashboardExplorePlano = {
  abas: string[]
  filtros: Array<{ nome: string; valor: string }>
  perguntaAnalitica: string
  objetivo?: string
}

export type AiExploreCard =
  | {
      kind: 'start_discovery'
      dashboardId: number
      dashboardNome: string
    }
  | {
      kind: 'discovery_running'
      jobId: string
      dashboardId: number
      dashboardNome: string
    }
  | {
      kind: 'discovery_ready'
      jobId: string
      dashboardId: number
      dashboardNome: string
      mapa: AiDashboardExploreMapa
    }
  | {
      kind: 'confirm_analysis'
      dashboardId: number
      dashboardNome: string
      plano: AiDashboardExplorePlano
    }
  | {
      kind: 'analysis_running'
      jobId: string
      dashboardId: number
      dashboardNome: string
      plano?: AiDashboardExplorePlano
    }
  | {
      kind: 'analysis_ready'
      jobId: string
      dashboardId: number
      dashboardNome: string
      plano?: AiDashboardExplorePlano
    }

export type AiDashboardExploreJobStatus = {
  id: string
  fase: 'discovery' | 'analysis'
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  mapa: AiDashboardExploreMapa | null
  plano: AiDashboardExplorePlano | null
  errorMessage: string | null
  threadId: string
  dashboardId: number
}
