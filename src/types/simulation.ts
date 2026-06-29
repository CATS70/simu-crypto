export type Frequence = 'quotidienne' | 'hebdomadaire' | 'mensuelle'

export interface SimulationParams {
  actif: string
  montant: number
  frequence: Frequence
  dateDebut: string // YYYY-MM-DD
  dateFin: string   // YYYY-MM-DD
}

export interface SimulationEntry {
  date: string
  prixDuJour: number
  montantInvesti: number
  quantiteAcquise: number
  montantInvestiCumule: number
  quantiteAcquiseCumulee: number
  valeurCumulee: number
}

export interface DailyPoint {
  date: string
  prixDuJour: number
  montantInvestiCumule: number
  quantiteAcquiseCumulee: number
  valeurCumulee: number
  gainsPertes: number // valeurCumulee - montantInvestiCumule (précompté pour recharts)
}

export interface SimulationResult {
  capitalFinal: number
  capitalInvesti: number
  plusValue: number
  performance: number         // ROI = (plusValue / capitalInvesti) * 100
  nbPeriodes: number          // nombre de versements effectués
  quantiteAcquiseCumulee: number
  prixMoyenAcquisition: number
  entries: SimulationEntry[]
  dailySeries: DailyPoint[]
  adjustedStart?: string     // si dateDebut ajustée (FR-050)
  warnings: string[]
}

export interface PricePoint {
  date: string // YYYY-MM-DD
  price: number
}

export interface CuratedAsset {
  id: string     // CoinGecko ID
  name: string
  symbol: string
}
