import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts'
import type { AiChartSpec } from '@/features/ai/ai-chart-types'

type AiChartRendererProps = {
  spec: AiChartSpec
}

const SERIES_COLORS = [
  'var(--vscode-accent)',
  '#4ec9b0',
  '#dcdcaa',
  '#f48771',
  '#c586c0',
  '#569cd6',
]

const GRID_COLOR = 'rgba(255,255,255,0.08)'
const AXIS_COLOR = 'var(--vscode-text-muted)'

const AXIS_PROPS = {
  stroke: AXIS_COLOR,
  fontSize: 11,
  tickLine: false,
} as const

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--vscode-input-bg)',
  border: '1px solid var(--vscode-border)',
  borderRadius: 6,
  fontSize: 12,
  color: 'var(--vscode-text)',
} as const

function seriesColor(index: number): string {
  return SERIES_COLORS[index % SERIES_COLORS.length]
}

export default function AiChartRenderer({ spec }: AiChartRendererProps) {
  const xAxisType = spec.xAxis.type === 'number' ? 'number' : 'category'

  const commonAxes = (
    <>
      <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" />
      <XAxis
        dataKey={spec.xAxis.key}
        type={xAxisType}
        name={spec.xAxis.label}
        {...AXIS_PROPS}
      />
      <YAxis unit={spec.yAxis?.unit} {...AXIS_PROPS} />
      <Tooltip contentStyle={TOOLTIP_STYLE} />
      {spec.series.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
    </>
  )

  return (
    <figure className="my-3 rounded-lg border border-vscode-border/70 bg-vscode-bg/40 p-3">
      <figcaption className="mb-2">
        <span className="block text-xs font-semibold text-vscode-text">{spec.title}</span>
        {spec.subtitle && (
          <span className="block text-[11px] text-vscode-text-muted">{spec.subtitle}</span>
        )}
      </figcaption>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {spec.type === 'bar' ? (
            <BarChart data={spec.data}>
              {commonAxes}
              {spec.series.map((series, index) => (
                <Bar
                  key={series.key}
                  dataKey={series.key}
                  name={series.label}
                  fill={seriesColor(index)}
                  radius={[3, 3, 0, 0]}
                />
              ))}
            </BarChart>
          ) : spec.type === 'area' ? (
            <AreaChart data={spec.data}>
              {commonAxes}
              {spec.series.map((series, index) => (
                <Area
                  key={series.key}
                  type="monotone"
                  dataKey={series.key}
                  name={series.label}
                  stroke={seriesColor(index)}
                  fill={seriesColor(index)}
                  fillOpacity={0.2}
                />
              ))}
            </AreaChart>
          ) : spec.type === 'scatter' ? (
            <ScatterChart data={spec.data}>
              {commonAxes}
              {spec.series.map((series, index) => (
                <Scatter
                  key={series.key}
                  dataKey={series.key}
                  name={series.label}
                  fill={seriesColor(index)}
                />
              ))}
            </ScatterChart>
          ) : (
            <LineChart data={spec.data}>
              {commonAxes}
              {spec.series.map((series, index) => (
                <Line
                  key={series.key}
                  type="monotone"
                  dataKey={series.key}
                  name={series.label}
                  stroke={seriesColor(index)}
                  dot={spec.data.length <= 30}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {(spec.source || spec.footnote) && (
        <p className="mt-2 text-[10px] leading-relaxed text-vscode-text-muted/80">
          {[spec.source, spec.footnote].filter(Boolean).join(' · ')}
        </p>
      )}
    </figure>
  )
}
