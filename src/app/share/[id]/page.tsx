import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSharedSimulation } from '@/lib/supabase'
import { fetchHistoricalPrices } from '@/lib/coingecko'
import { runSimulation } from '@/lib/dca'
import { Simulateur } from '@/components/Simulateur'
import type { SimulationParams } from '@/types/simulation'

interface SharePageProps {
  readonly params: Promise<{ id: string }>
}

async function ShareContent({ params }: SharePageProps) {
  const { id } = await params
  const shared = await getSharedSimulation(id)
  if (!shared) notFound()

  const simulationParams = shared.params as SimulationParams

  let result = null
  try {
    const prices = await fetchHistoricalPrices(
      simulationParams.actif,
      simulationParams.dateDebut,
      simulationParams.dateFin,
    )
    result = runSimulation(simulationParams, prices)
  } catch {
    // Result null → affiche uniquement le formulaire pré-rempli
  }

  return (
    <div data-theme="dark" style={{ minHeight: '100vh', background: 'var(--bg)', padding: '32px 24px' }}>
      <header style={{ maxWidth: '1200px', margin: '0 auto 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Simulation partagée
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Résultats calculés au moment de la consultation.
          </p>
        </div>
        <Link
          href="/"
          style={{
            marginLeft: 'auto', padding: '9px 18px',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '8px', color: 'var(--text)',
            textDecoration: 'none', fontSize: '13px', fontWeight: 500,
          }}
        >
          Modifier
        </Link>
      </header>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Simulateur
          initialParams={simulationParams}
          {...(result ? { initialResult: result } : {})}
        />
      </div>
    </div>
  )
}

export default function SharePage(props: SharePageProps) {
  return (
    <Suspense fallback={<div data-theme="dark" style={{ minHeight: '100vh', background: 'var(--bg)' }} />}>
      <ShareContent params={props.params} />
    </Suspense>
  )
}
