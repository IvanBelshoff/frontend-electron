import { useQuery } from '@tanstack/react-query'

import {

  getCurrentMetrics,

  getLiveMetrics,

  getMetricsHistory,

} from '@/features/system-metrics/system-metrics-api'



const LIVE_POLL_INTERVAL_MS = 15_000

const STANDARD_POLL_INTERVAL_MS = 60_000



export function useLiveMetrics() {

  return useQuery({

    queryKey: ['system-metrics', 'live'],

    queryFn: getLiveMetrics,

    refetchInterval: LIVE_POLL_INTERVAL_MS,

  })

}



export function useCurrentMetrics() {

  return useQuery({

    queryKey: ['system-metrics', 'current'],

    queryFn: getCurrentMetrics,

    refetchInterval: STANDARD_POLL_INTERVAL_MS,

  })

}



export function useMetricsHistory(hours = 24) {

  return useQuery({

    queryKey: ['system-metrics', 'history', hours],

    queryFn: () => getMetricsHistory(hours),

    refetchInterval: STANDARD_POLL_INTERVAL_MS,

  })

}


