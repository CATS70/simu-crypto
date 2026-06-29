import { NextRequest, NextResponse } from 'next/server'
import { SimulationParamsSchema } from '@/lib/validation'
import { insertSharedSimulation } from '@/lib/supabase'
import config from '@/lib/config'

// FR-028 — POST /api/share : persiste les params, retourne l'id
export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps de la requête invalide.', code: 'VALIDATION_ERROR' }, { status: 400 })
  }

  const parsed = SimulationParamsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Paramètres invalides.', code: 'VALIDATION_ERROR' },
      { status: 400 },
    )
  }

  const { actif, montant, frequence, dateDebut, dateFin } = parsed.data
  const params: import('@/types/simulation').SimulationParams = {
    actif, montant, frequence, dateDebut, dateFin,
  }

  try {
    const id = await insertSharedSimulation(params)
    const shareUrl = `${config.appUrl}/share/${id}`
    return NextResponse.json({ id, url: shareUrl }, { status: 201 })
  } catch (err) {
    console.error('Error inserting shared simulation:', err)
    return NextResponse.json(
      { error: 'Impossible de sauvegarder la simulation. Veuillez réessayer.', code: 'SUPABASE_ERROR' },
      { status: 502 },
    )
  }
}
