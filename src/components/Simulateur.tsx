'use client'

import { useState, useRef } from 'react'
import { SimulateurForm } from './SimulateurForm'
import { ResultsGrid } from './ResultsGrid'
import { ChartTabs } from './ChartTabs'
import { CalendrierTab } from './CalendrierTab'
import { SharePanel } from './SharePanel'
import { getAsset } from '@/lib/assets'
import type { SimulationParams, SimulationResult } from '@/types/simulation'

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
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', color: 'var(--text)' }}>
            Paramètres
          </h2>
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
          <div
            style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid var(--color-loss)',
              borderRadius: '12px', padding: '16px',
              color: 'var(--color-loss)', marginBottom: '24px', fontSize: '14px',
            }}
            role="alert"
          >
            {error}
          </div>
        )}

        {result && params && asset && (
          <div ref={resultsRef}>
            {/* Warnings */}
            {result.warnings && result.warnings.length > 0 && (
              <div
                style={{
                  background: 'rgba(239,209,88,0.1)', border: '1px solid var(--accent-primary)',
                  borderRadius: '12px', padding: '14px 16px',
                  color: 'var(--text)', marginBottom: '20px', fontSize: '13px',
                }}
              >
                {result.warnings.map((w, i) => <p key={i}>{w}</p>)}
              </div>
            )}

            {/* KPIs */}
            <section
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '28px',
                boxShadow: 'var(--card-shadow)',
                marginBottom: '28px',
              }}
            >
              <ResultsGrid result={result} params={params} />
            </section>

            {/* Onglets */}
            <section
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: 'var(--card-shadow)',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
                {(['graphiques', 'calendrier'] as Tab[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    style={{
                      padding: '8px 18px', borderRadius: '8px', border: 'none',
                      background: tab === t ? 'var(--accent-secondary)' : 'transparent',
                      color: tab === t ? '#fff' : 'var(--text-muted)',
                      fontWeight: tab === t ? 600 : 400,
                      fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                    }}
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
                  style={{
                    width: '100%', padding: '12px',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: '10px', color: 'var(--text)',
                    fontSize: '14px', fontWeight: 500,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
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
          <div
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              minHeight: '300px', color: 'var(--text-muted)', textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>📈</p>
            <p style={{ fontSize: '16px' }}>Configurez votre simulation et cliquez sur <strong>Simuler</strong></p>
          </div>
        )}
      </main>
    </div>
    </div>
  )
}
