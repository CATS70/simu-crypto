// NFR-009 — Log structuré JSON sur stderr pour les erreurs CoinGecko
export function logCoinGeckoError(params: {
  status: number | string
  asset: string
  durationMs: number
  cgCode?: number
  error?: unknown
}): void {
  const entry: Record<string, unknown> = {
    level: 'error',
    event: 'coingecko_unavailable',
    status: params.status,
    asset: params.asset,
    durationMs: params.durationMs,
    timestamp: new Date().toISOString(),
  }
  if (params.cgCode !== undefined) entry['cgCode'] = params.cgCode
  // Ne jamais logger le message d'erreur interne en clair (peut contenir des infos sensibles)
  process.stderr.write(JSON.stringify(entry) + '\n')
}
