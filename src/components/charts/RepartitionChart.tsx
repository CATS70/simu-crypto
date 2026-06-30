'use client'

import { useState } from 'react'
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import type { DailyPoint } from '@/types/simulation'
import styles from './Charts.module.css'

// Couleurs hex explicites — html-to-image ne résout pas var(--x) dans les attributs SVG
const C = {
  gain:     '#11D05A',
  gainBg:   'rgba(17,208,90,0.15)',
  loss:     '#FF0500',
  lossBg:   'rgba(255,5,0,0.15)',
  investi:  '#7C6DB5',
  value:    '#F8D047',
  border:   'rgba(255,255,255,0.08)',
  surface:  '#0F172A',
  tooltip:  '#00173F',
  muted:    '#9CA3AF',
  accent:   '#1098F7',
} as const

const fmtEur = (v: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v)

const fmtK = (v: number) => {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1)}k`
  return String(Math.round(v))
}

interface ZoomDomain { start: string; end: string }

// Données enrichies pour le rendu : gains et pertes séparés pour coloration distincte
interface ChartPoint extends DailyPoint {
  gains: number  // max(gainsPertes, 0)
  pertes: number // min(gainsPertes, 0)
}

interface RepartitionChartProps {
  readonly data: DailyPoint[]
}

export function RepartitionChart({ data }: RepartitionChartProps) {
  const [zoomLeft, setZoomLeft]       = useState<string>('')
  const [zoomRight, setZoomRight]     = useState<string>('')
  const [selecting, setSelecting]     = useState(false)
  const [domainStack, setDomainStack] = useState<ZoomDomain[]>([])

  const currentDomain = domainStack.length > 0 ? domainStack.at(-1) ?? null : null

  const visibleData: ChartPoint[] = (currentDomain
    ? data.filter((d) => d.date >= currentDomain.start && d.date <= currentDomain.end)
    : data
  ).map((d) => ({
    ...d,
    gains:  Math.max(0, d.gainsPertes),
    pertes: Math.min(0, d.gainsPertes),
  }))

  const tickFormatter = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00Z')
    if (visibleData.length <= 90) {
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    }
    return d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
  }

  const handleMouseDown = (e: { activeLabel?: string }) => {
    if (!e.activeLabel) return
    setZoomLeft(e.activeLabel)
    setZoomRight(e.activeLabel)
    setSelecting(true)
  }

  const handleMouseMove = (e: { activeLabel?: string }) => {
    if (!selecting || !e.activeLabel) return
    setZoomRight(e.activeLabel)
  }

  const handleMouseUp = () => {
    if (!selecting || !zoomLeft || !zoomRight || zoomLeft === zoomRight) {
      setSelecting(false)
      setZoomLeft('')
      setZoomRight('')
      return
    }
    const [start, end] = zoomLeft <= zoomRight
      ? [zoomLeft, zoomRight]
      : [zoomRight, zoomLeft]
    setDomainStack((prev) => [...prev, { start, end }])
    setSelecting(false)
    setZoomLeft('')
    setZoomRight('')
  }

  const handleZoomBack = () => setDomainStack((prev) => prev.slice(0, -1))

  return (
    <div>
      <div className={styles.zoomBar}>
        <button
          type="button"
          onClick={handleZoomBack}
          disabled={domainStack.length === 0}
          className={styles.zoomBtn}
        >
          − Zoom arrière
        </button>
      </div>
      <div className={styles.chartArea}>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart
            data={visibleData}
            margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} opacity={0.5} />
            <XAxis
              dataKey="date"
              tickFormatter={tickFormatter}
              tick={{ fill: C.muted, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: C.border }}
              minTickGap={40}
            />
            <YAxis
              yAxisId="eur"
              orientation="left"
              tickFormatter={fmtK}
              domain={['auto', 'auto']}
              tick={{ fill: C.muted, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={55}
            />

            <Tooltip
              contentStyle={{
                background: C.tooltip,
                border: `1px solid ${C.border}`,
                borderRadius: '8px',
                color: '#fff',
                fontSize: '13px',
              }}
              formatter={(value: number, name: string) => [fmtEur(value), name]}
              labelFormatter={(label: string) =>
                new Date(label + 'T00:00:00Z').toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })
              }
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: C.muted, paddingTop: '8px' }} />

            <ReferenceLine yAxisId="eur" y={0} stroke={C.border} strokeDasharray="4 2" />

            <Area
              yAxisId="eur"
              type="monotone"
              dataKey="gains"
              name="Gains"
              baseValue={0}
              fill={C.gainBg}
              stroke={C.gain}
              strokeWidth={1.5}
              dot={false}
              legendType="none"
            />
            <Area
              yAxisId="eur"
              type="monotone"
              dataKey="pertes"
              name="Pertes"
              baseValue={0}
              fill={C.lossBg}
              stroke={C.loss}
              strokeWidth={1.5}
              dot={false}
              legendType="none"
            />
            <Line
              yAxisId="eur"
              type="monotone"
              dataKey="montantInvestiCumule"
              name="Investi"
              stroke={C.investi}
              strokeWidth={2}
              strokeDasharray="4 2"
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              yAxisId="eur"
              type="monotone"
              dataKey="valeurCumulee"
              name="Valeur"
              stroke={C.value}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />

            {selecting && zoomLeft && zoomRight && (
              <ReferenceArea
                yAxisId="eur"
                x1={zoomLeft}
                x2={zoomRight}
                fill={C.accent}
                fillOpacity={0.15}
                stroke={C.accent}
                strokeOpacity={0.4}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
