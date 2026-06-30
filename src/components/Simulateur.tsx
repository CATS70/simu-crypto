'use client'

import { useState, useRef } from 'react'
import { SimulateurForm } from './SimulateurForm'
import { ResultsGrid } from './ResultsGrid'
import { ChartTabs } from './ChartTabs'
import { CalendrierTab } from './CalendrierTab'
import { SharePanel } from './SharePanel'
import { getAsset } from '@/lib/assets'
import type { SimulationParams, SimulationResult } from '@/types/simulation'
import styles from './Simulateur.module.css'

type Tab = 'graphiques' | 'calendrier'

interface SimulateurProps {
  readonly initialParams?: SimulationParams
  readonly initialResult?: SimulationResult
}

function isApiError(v: unknown): v is { error: string } {
  return typeof v === 'object' && v !== null && 'error' in v && typeof (v as { error: unknown }).error === 'string'
}

function isApiResult(v: unknown): v is { result: SimulationResult } {
  return typeof v === 'object' && v !== null && 'result' in v
}

export function Simulateur({ initialParams, initialResult }: SimulateurProps) {
  const [params, setParams] = useState<SimulationParams | null>(initialParams ?? null)
  const [result, setResult] = useState<SimulationResult | null>(initialResult ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('graphiques')
  const [showShare, setShowShare] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  const asset = params ? (getAsset(params.actif) ?? null) : null

  const handleSubmit = async (newParams: SimulationParams) => {
    setLoading(true)
    setError(null)
    setResult(null)
    setShowShare(false)
    setParams(newParams)
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newParams),
      })
      const data: unknown = await res.json()
      if (!res.ok || !isApiResult(data)) {
        throw new Error(isApiError(data) ? data.error : 'Erreur de calcul.')
      }
      setResult(data.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="simulateur-container">
      <div className="simulateur-layout">
        {/* Colonne gauche — formulaire */}
        <aside>
          <div className={styles.formPanel}>
            <h2 className={styles.formTitle}>Paramètres</h2>
            <SimulateurForm
              {...(params ? { initialParams: params } : {})}
              onSubmit={handleSubmit}
              loading={loading}
            />
          </div>
        </aside>

        {/* Colonne droite — résultats */}
        <main>
          {error && (
            <div className={styles.errorBanner} role="alert">
              {error}
            </div>
          )}

          {result && params && asset && (
            <div ref={resultsRef}>
              {/* Warnings */}
              {result.warnings && result.warnings.length > 0 && (
                <div className={styles.warningBanner}>
                  {result.warnings.map((w) => <p key={w}>{w}</p>)}
                </div>
              )}

              {/* KPIs */}
              <section className={styles.kpiSection}>
                <ResultsGrid result={result} params={params} />
              </section>

              {/* Onglets */}
              <section className={styles.tabSection}>
                <div className={styles.tabBar}>
                  {(['graphiques', 'calendrier'] as Tab[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTab(t)}
                      className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
                    >
                      {t === 'graphiques' ? 'Graphiques' : 'Calendrier'}
                    </button>
                  ))}
                </div>
                {tab === 'graphiques' ? (
                  <ChartTabs result={result} asset={asset} />
                ) : (
                  <CalendrierTab entries={result.entries} asset={asset} />
                )}
              </section>

              {/* Partage */}
              <div>
                {!showShare ? (
                  <button
                    type="button"
                    onClick={() => setShowShare(true)}
                    className={styles.shareBtn}
                  >
                    Partager cette simulation
                  </button>
                ) : (
                  <SharePanel
                    params={params}
                    resultsRef={resultsRef}
                    onClose={() => setShowShare(false)}
                  />
                )}
              </div>
            </div>
          )}

          {!result && !loading && !error && (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateIcon}>📈</p>
              <p>Configurez votre simulation et cliquez sur <strong>Simuler</strong></p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
