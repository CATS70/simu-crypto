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
  ResponsiveContainer,
} from 'recharts'
import type { DailyPoint } from '@/types/simulation'
import styles from './Charts.module.css'

// Couleurs hex explicites — html-to-image ne résout pas var(--x) dans les attributs SVG
const C = {
  investi: '#7C6DB5',
  acquis:  '#F8D047',
  value:   '#1098F7',
  prix:    '#6B7280',
  border:  'rgba(255,255,255,0.08)',
  tooltip: '#00173F',
  muted:   '#9CA3AF',
  accent:  '#1098F7',
} as const

const fmtEur = (v: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v)

const fmtK = (v: number) => {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1)}k`
  return v.toFixed(0)
}

interface ZoomDomain { start: string; end: string }

interface HistoriqueChartProps {
  readonly data: DailyPoint[]
  readonly symbol: string
}

export function HistoriqueChart({ data, symbol }: HistoriqueChartProps) {
  const [zoomLeft, setZoomLeft]       = useState<string>('')
  const [zoomRight, setZoomRight]     = useState<string>('')
  const [selecting, setSelecting]     = useState(false)
  // Stack de zoom : chaque entrée = un niveau de zoom successif
  const [domainStack, setDomainStack] = useState<ZoomDomain[]>([])

  const currentDomain = domainStack.length > 0 ? domainStack.at(-1) ?? null : null

  const visibleData = currentDomain
    ? data.filter((d) => d.date >= currentDomain.start && d.date <= currentDomain.end)
    : data

  // Abscisse adaptative selon la densité visible
  const tickFormatter = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00Z')
    if (visibleData.length <= 90) {
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    }
    return d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
  }

  const fmtCrypto = (v: number) => `${v.toFixed(4)} ${symbol}`

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

  // Revient au niveau de zoom précédent
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
            margin={{ top: 10, right: 65, left: 10, bottom: 0 }}
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
              yAxisId="qty"
              orientation="left"
              tickFormatter={(v: number) => v.toFixed(4)}
              tick={{ fill: C.acquis, fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={65}
            />
            <YAxis
              yAxisId="eur"
              orientation="right"
              tickFormatter={fmtK}
              tick={{ fill: C.muted, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={60}
            />
            <YAxis yAxisId="prix" orientation="right" hide />

            <Tooltip
              contentStyle={{
                background: C.tooltip,
                border: `1px solid ${C.border}`,
                borderRadius: '8px',
                color: '#fff',
                fontSize: '13px',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'Acquis') return [fmtCrypto(value), name]
                return [fmtEur(value), name]
              }}
              labelFormatter={(label: string) =>
                new Date(label + 'T00:00:00Z').toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })
              }
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: C.muted, paddingTop: '8px' }} />

            <Line
              yAxisId="qty"
              type="stepAfter"
              dataKey="quantiteAcquiseCumulee"
              name="Acquis"
              stroke={C.acquis}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Area
              yAxisId="eur"
              type="monotone"
              dataKey="valeurCumulee"
              name="Valeur"
              stroke={C.value}
              fill={C.value}
              fillOpacity={0.12}
              strokeWidth={2}
              dot={false}
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
            />
            <Line
              yAxisId="prix"
              type="monotone"
              dataKey="prixDuJour"
              name="Prix"
              stroke={C.prix}
              strokeWidth={1.5}
              strokeDasharray="4 2"
              dot={false}
              activeDot={{ r: 3 }}
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
