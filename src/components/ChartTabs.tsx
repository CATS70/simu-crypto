'use client'

import { useState } from 'react'
import { RepartitionChart } from './charts/RepartitionChart'
import { HistoriqueChart } from './charts/HistoriqueChart'
import type { SimulationResult, CuratedAsset } from '@/types/simulation'
import styles from './ChartTabs.module.css'

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
      <div role="tablist" aria-label="Type de graphique" className={styles.tabBar}>
        {(['repartition', 'historique'] as ChartView[]).map((v) => (
          <button
            key={v}
            role="tab"
            type="button"
            id={`chart-tab-${v}`}
            aria-selected={view === v}
            aria-controls={`chart-panel-${v}`}
            onClick={() => setView(v)}
            className={`${styles.tab} ${view === v ? styles.tabActive : ''}`}
          >
            {v === 'repartition' ? 'Gains / Pertes' : 'Historique'}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`chart-panel-${view}`}
        aria-labelledby={`chart-tab-${view}`}
      >
        {view === 'repartition' ? (
          <RepartitionChart data={dailySeries} />
        ) : (
          <HistoriqueChart data={dailySeries} symbol={asset.symbol} />
        )}
      </div>
    </div>
  )
}
