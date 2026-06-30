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
      <div className={styles.tabBar}>
        {(['repartition', 'historique'] as ChartView[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`${styles.tab} ${view === v ? styles.tabActive : ''}`}
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
