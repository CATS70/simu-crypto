function toStderr(entry: Record<string, unknown>): void {
  process.stderr.write(JSON.stringify(entry) + '\n')
}

function safeErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return 'Unknown error'
}

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
  // Log le message d'erreur réseau (DNS, TLS, timeout) pour faciliter le débogage
  if (params.error !== undefined) entry['errorMessage'] = safeErrorMessage(params.error)
  toStderr(entry)
}

export function logSupabaseError(params: {
  operation: 'insert' | 'select'
  table: string
  error: unknown
}): void {
  toStderr({
    level: 'error',
    event: 'supabase_error',
    operation: params.operation,
    table: params.table,
    errorMessage: safeErrorMessage(params.error),
    timestamp: new Date().toISOString(),
  })
}
