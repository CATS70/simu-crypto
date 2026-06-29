import type {
  SimulationParams,
  SimulationResult,
  SimulationEntry,
  DailyPoint,
  PricePoint,
} from '@/types/simulation'

export class SimulationError extends Error {
  constructor(
    public readonly code: 'NO_DATA' | 'VALIDATION_ERROR',
    message: string,
  ) {
    super(message)
    this.name = 'SimulationError'
  }
}

// ─── Date utilities ─────────────────────────────────────────────────────────

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().split('T')[0] as string
}

function addMonths(dateStr: string, n: number): string {
  const d = new Date(dateStr)
  const originalDay = d.getUTCDate()
  d.setUTCDate(1)
  d.setUTCMonth(d.getUTCMonth() + n)
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate()
  d.setUTCDate(Math.min(originalDay, lastDay))
  return d.toISOString().split('T')[0] as string
}

// ─── Investment date generation ──────────────────────────────────────────────

function generateInvestmentDates(
  startDate: string,
  endDate: string,
  frequence: SimulationParams['frequence'],
): string[] {
  const dates: string[] = []
  let current = startDate

  while (current <= endDate) {
    dates.push(current)
    switch (frequence) {
      case 'quotidienne':
        current = addDays(current, 1)
        break
      case 'hebdomadaire':
        current = addDays(current, 7)
        break
      case 'mensuelle':
        current = addMonths(current, 1)
        break
    }
  }

  return dates
}

// ─── Price lookup ────────────────────────────────────────────────────────────

function findNearestPrice(
  targetDate: string,
  prices: PricePoint[],
): { actualDate: string; price: number } {
  // Try exact match
  const exact = prices.find((p) => p.date === targetDate)
  if (exact) return { actualDate: exact.date, price: exact.price }

  // Use first price available after targetDate
  const after = prices.find((p) => p.date > targetDate)
  if (after) return { actualDate: after.date, price: after.price }

  // Fall back to last available price
  const last = prices[prices.length - 1]
  if (!last) throw new SimulationError('NO_DATA', 'Aucune donnée de prix disponible.')
  return { actualDate: last.date, price: last.price }
}

function getPriceForDay(date: string, prices: PricePoint[]): number {
  // Last known price on or before this date (carry forward)
  let result = prices[0]?.price ?? 0
  for (const p of prices) {
    if (p.date <= date) {
      result = p.price
    } else {
      break
    }
  }
  return result
}

// ─── Main simulation function ────────────────────────────────────────────────

export function runSimulation(
  params: SimulationParams,
  prices: PricePoint[],
): SimulationResult {
  const warnings: string[] = []

  if (prices.length === 0) {
    throw new SimulationError('NO_DATA', 'Aucune donnée disponible pour cet actif sur la période demandée.')
  }

  const firstAvailableDate = prices[0]?.date ?? ''
  const lastAvailableDate = prices[prices.length - 1]?.date ?? ''

  // FR-051 — reject entirely if dateFin is before first available price
  if (params.dateFin < firstAvailableDate) {
    throw new SimulationError(
      'NO_DATA',
      `Aucune donnée historique disponible pour cet actif avant le ${firstAvailableDate}. La période demandée est entièrement antérieure à la première cotation.`,
    )
  }

  // FR-050 — adjust dateDebut if before first available price
  let effectiveStart = params.dateDebut
  if (params.dateDebut < firstAvailableDate) {
    effectiveStart = firstAvailableDate
    warnings.push(
      `Les données historiques pour cet actif ne sont disponibles qu'à partir du ${firstAvailableDate}. La simulation démarre à cette date.`,
    )
  }

  // Clamp effectiveStart to lastAvailableDate if needed
  if (effectiveStart > lastAvailableDate) {
    throw new SimulationError('NO_DATA', 'Aucune donnée disponible sur la période demandée.')
  }

  // Generate investment dates
  const investmentDates = generateInvestmentDates(
    effectiveStart,
    params.dateFin,
    params.frequence,
  )

  // Build investment schedule: resolve actual price date for each investment
  const seenWarnings = new Set<string>()
  const investments = investmentDates.map((date) => {
    const { actualDate, price } = findNearestPrice(date, prices)
    if (actualDate !== date) {
      const msg = `Aucune cotation disponible le ${date}. Le prix du ${actualDate} a été utilisé à la place.`
      if (!seenWarnings.has(msg)) {
        warnings.push(msg)
        seenWarnings.add(msg)
      }
    }
    return {
      targetDate: date,
      date: actualDate,
      prixDuJour: price,
      montantInvesti: params.montant,
      quantiteAcquise: params.montant / price,
    }
  })

  // Build entries[] — one per investment period
  const entries: SimulationEntry[] = []
  let montantInvestiCumule = 0
  let quantiteAcquiseCumulee = 0

  for (const inv of investments) {
    montantInvestiCumule += inv.montantInvesti
    quantiteAcquiseCumulee += inv.quantiteAcquise
    entries.push({
      date: inv.date,
      prixDuJour: inv.prixDuJour,
      montantInvesti: inv.montantInvesti,
      quantiteAcquise: inv.quantiteAcquise,
      montantInvestiCumule,
      quantiteAcquiseCumulee,
      valeurCumulee: quantiteAcquiseCumulee * inv.prixDuJour,
    })
  }

  // Build dailySeries[] — one per calendar day for smooth charts
  const dailySeries = buildDailySeries(effectiveStart, params.dateFin, investments, prices)

  // Final totals using the last daily point
  const capitalInvesti = montantInvestiCumule
  const finalDayPrice = getPriceForDay(params.dateFin, prices)
  const capitalFinal = quantiteAcquiseCumulee * finalDayPrice
  const plusValue = capitalFinal - capitalInvesti
  const performance = capitalInvesti !== 0 ? (plusValue / capitalInvesti) * 100 : 0
  const nbPeriodes = investments.length
  const prixMoyenAcquisition = quantiteAcquiseCumulee !== 0 ? capitalInvesti / quantiteAcquiseCumulee : 0

  return {
    capitalFinal,
    capitalInvesti,
    plusValue,
    performance,
    nbPeriodes,
    quantiteAcquiseCumulee,
    prixMoyenAcquisition,
    entries,
    dailySeries,
    ...(effectiveStart !== params.dateDebut ? { adjustedStart: effectiveStart } : {}),
    warnings,
  }
}

// ─── Daily series builder ────────────────────────────────────────────────────

interface InvestmentRecord {
  date: string
  montantInvesti: number
  quantiteAcquise: number
}

function buildDailySeries(
  startDate: string,
  endDate: string,
  investments: InvestmentRecord[],
  prices: PricePoint[],
): DailyPoint[] {
  // Group investments by actual date
  const investByDate = new Map<string, { montant: number; quantite: number }>()
  for (const inv of investments) {
    const existing = investByDate.get(inv.date)
    if (existing) {
      existing.montant += inv.montantInvesti
      existing.quantite += inv.quantiteAcquise
    } else {
      investByDate.set(inv.date, { montant: inv.montantInvesti, quantite: inv.quantiteAcquise })
    }
  }

  const series: DailyPoint[] = []
  let montantInvestiCumule = 0
  let quantiteAcquiseCumulee = 0

  const current = new Date(startDate + 'T00:00:00Z')
  const end = new Date(endDate + 'T00:00:00Z')

  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0] as string

    const inv = investByDate.get(dateStr)
    if (inv) {
      montantInvestiCumule += inv.montant
      quantiteAcquiseCumulee += inv.quantite
    }

    const price = getPriceForDay(dateStr, prices)
    const valeurCumulee = quantiteAcquiseCumulee * price

    series.push({
      date: dateStr,
      prixDuJour: price,
      montantInvestiCumule,
      quantiteAcquiseCumulee,
      valeurCumulee,
      gainsPertes: valeurCumulee - montantInvestiCumule,
    })

    current.setUTCDate(current.getUTCDate() + 1)
  }

  return series
}

// ─── Price normalization (exported for use in coingecko.ts) ──────────────────

export function normalizeToDailyPrices(rawPrices: [number, number][]): PricePoint[] {
  const byDay = new Map<string, number>()
  for (const [ts, price] of rawPrices) {
    const date = new Date(ts).toISOString().split('T')[0] as string
    if (!byDay.has(date)) {
      byDay.set(date, price)
    }
  }
  return Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, price]) => ({ date, price }))
}
