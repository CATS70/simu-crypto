import { NextRequest, NextResponse } from 'next/server'
import { SimulationParamsSchema } from '@/lib/validation'
import { runSimulation, SimulationError } from '@/lib/dca'
import { fetchHistoricalPrices, CoinGeckoError } from '@/lib/coingecko'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps de la requête invalide.', code: 'VALIDATION_ERROR' }, { status: 400 })
  }

  // FR-041 à FR-048 — validation côté serveur
  const parsed = SimulationParamsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Paramètres invalides.', code: 'VALIDATION_ERROR', details: parsed.error.errors },
      { status: 400 },
    )
  }

  const { actif, montant, frequence, dateDebut, dateFin } = parsed.data
  const params: import('@/types/simulation').SimulationParams = {
    actif, montant, frequence, dateDebut, dateFin,
  }

  try {
    const prices = await fetchHistoricalPrices(params.actif, params.dateDebut, params.dateFin)
    const result = runSimulation(params, prices)
    return NextResponse.json({ result })
  } catch (err) {
    if (err instanceof SimulationError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 422 })
    }
    // instanceof échoue sur les erreurs traversant la frontière "use cache" — vérifier le nom
    if (err instanceof CoinGeckoError || (err instanceof Error && err.name === 'CoinGeckoError')) {
      return NextResponse.json({ error: (err as Error).message, code: 'COINGECKO_ERROR' }, { status: 502 })
    }
    console.error('Unexpected error in /api/simulate:', err)
    return NextResponse.json({ error: 'Une erreur inattendue est survenue.', code: 'SERVER_ERROR' }, { status: 500 })
  }
}
