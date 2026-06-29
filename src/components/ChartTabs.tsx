'use client'

import { useState } from 'react'
import { RepartitionChart } from './charts/RepartitionChart'
import { HistoriqueChart } from './charts/HistoriqueChart'
import type { SimulationResult, CuratedAsset } from '@/types/simulation'

interface ChartTabsProps {
  readonly result: SimulationResult
  readonly asset: CuratedAsset
}

type ChartView = 'repartition' | 'historique'

export function ChartTabs({ result, asset }: ChartTabsProps) {
  const [view, setView] = useState<ChartView>('repartition')
  const { dailySeries } = result

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {(['repartition', 'historique'] as ChartView[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: view === v ? 'var(--accent-primary)' : 'var(--surface)',
              color: view === v ? 'var(--text-inverse)' : 'var(--text)',
              fontWeight: 500,
              fontSize: '13px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
          >
            {v === 'repartition' ? 'Gains / Pertes' : 'Historique'}
          </button>
        ))}
      </div>

      {view === 'repartition' ? (
        <RepartitionChart data={dailySeries} />
      ) : (
        <HistoriqueChart data={dailySeries} symbol={asset.symbol} />
      )}
    </div>
  )
}
