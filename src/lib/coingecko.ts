import { cacheLife } from 'next/cache'
import { logCoinGeckoError } from './logger'
import { normalizeToDailyPrices } from './dca'
import type { PricePoint } from '@/types/simulation'

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3'

// Lecture de la clé HORS du contexte "use cache" — process.env y est inaccessible.
function getApiKey(): string {
  return process.env.COINGECKO_API_KEY ?? ''
}

export async function fetchHistoricalPrices(
  assetId: string,
  dateDebut: string,
  dateFin: string,
): Promise<PricePoint[]> {
  return fetchCached(assetId, dateDebut, dateFin, getApiKey())
}

async function fetchCached(
  assetId: string,
  dateDebut: string,
  dateFin: string,
  apiKey: string,
): Promise<PricePoint[]> {
  'use cache'
  cacheLife('hours')

  const from = Math.floor(new Date(dateDebut + 'T00:00:00Z').getTime() / 1000)
  const to   = Math.floor(new Date(dateFin  + 'T23:59:59Z').getTime() / 1000)

  const url = new URL(`${COINGECKO_BASE}/coins/${encodeURIComponent(assetId)}/market_chart/range`)
  url.searchParams.set('vs_currency', 'eur')
  url.searchParams.set('from', String(from))
  url.searchParams.set('to',   String(to))
  if (apiKey) url.searchParams.set('x_cg_demo_api_key', apiKey)

  const start = Date.now()

  let response: Response
  try {
    response = await fetch(url.toString(), { headers: { Accept: 'application/json' } })
  } catch (err) {
    const durationMs = Date.now() - start
    logCoinGeckoError({ status: 'NETWORK_ERROR', asset: assetId, durationMs, error: err })
    throw new CoinGeckoError(
      'Impossible de joindre CoinGecko. Vérifiez votre connexion réseau.',
      'NETWORK_ERROR',
    )
  }

  const durationMs = Date.now() - start
  const body: unknown = await response.json().catch(() => null)

  // Extraire le error_code CoinGecko si présent dans le body
  const cgCode = extractCoinGeckoCode(body)

  if (!response.ok || cgCode !== null) {
    const cgMessage = extractCoinGeckoMessage(body)
    logCoinGeckoError({ status: response.status, asset: assetId, durationMs })
    throw new CoinGeckoError(
      cgMessage ?? `Erreur CoinGecko (HTTP ${response.status}).`,
      cgCode !== null ? String(cgCode) : String(response.status),
    )
  }

  if (!isCoinGeckoResponse(body)) {
    logCoinGeckoError({ status: 'INVALID_RESPONSE', asset: assetId, durationMs })
    throw new CoinGeckoError('Réponse CoinGecko inattendue.', 'INVALID_RESPONSE')
  }

  return normalizeToDailyPrices(body.prices)
}

function extractCoinGeckoMessage(body: unknown): string | null {
  if (typeof body !== 'object' || body === null) return null
  // Format { error: { status: { error_message: "..." } } }
  const err = (body as { error?: { status?: { error_message?: unknown } } }).error
  if (typeof err?.status?.error_message === 'string') return err.status.error_message
  // Format { status: { error_message: "..." } }
  const status = (body as { status?: { error_message?: unknown } }).status
  if (typeof status?.error_message === 'string') return status.error_message
  return null
}

function extractCoinGeckoCode(body: unknown): number | null {
  if (
    typeof body === 'object' && body !== null &&
    'error' in body &&
    typeof (body as { error: unknown }).error === 'object'
  ) {
    const err = (body as { error: { status?: { error_code?: unknown } } }).error
    const code = err?.status?.error_code
    if (typeof code === 'number') return code
  }
  // Format alternatif : { status: { error_code: ... } }
  if (
    typeof body === 'object' && body !== null &&
    'status' in body
  ) {
    const code = (body as { status?: { error_code?: unknown } }).status?.error_code
    if (typeof code === 'number') return code
  }
  return null
}

export class CoinGeckoError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'UNKNOWN',
  ) {
    super(message)
    this.name = 'CoinGeckoError'
  }
}

function isCoinGeckoResponse(value: unknown): value is { prices: [number, number][] } {
  return (
    typeof value === 'object' && value !== null &&
    'prices' in value &&
    Array.isArray((value as { prices: unknown }).prices)
  )
}
