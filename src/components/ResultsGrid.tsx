import type { SimulationResult, SimulationParams } from '@/types/simulation'
import { getAsset } from '@/lib/assets'
import { FieldTooltip } from './ui/FieldTooltip'
import styles from './ResultsGrid.module.css'

// Formateur manuel — garantit   comme séparateur de milliers
// indépendamment des données ICU disponibles dans Node.js / WSL.
function groupDigits(n: number, decimals: number): string {
  const [intPart, decPart = ''] = n.toFixed(decimals).split('.')
  const int = intPart!
  const groups: string[] = []
  for (let i = int.length; i > 0; i -= 3) {
    groups.unshift(int.slice(Math.max(0, i - 3), i))
  }
  const grouped = groups.join(' ')
  return decimals > 0 ? `${grouped},${decPart}` : grouped
}

const fmtEur = (v: number) => `${groupDigits(v, 2)} €`

const fmtPct = (v: number, withSign = false) => {
  const abs = groupDigits(Math.abs(v), 2)
  let sign: string
  if (v < 0) {
    sign = '−'
  } else if (withSign) {
    sign = '+'
  } else {
    sign = ''
  }
  return `${sign}${abs} %`
}

const fmtCrypto = (v: number, decimals = 8) => groupDigits(v, decimals)

interface ResultsGridProps {
  readonly result: SimulationResult
  readonly params: SimulationParams
}

const KPI_INFO: Record<string, string> = {
  investi:  'Total des sommes versées sur la période, hors frais éventuels.',
  acquis:   "Quantité totale de l'actif accumulée grâce aux achats périodiques.",
  prix:     "Coût moyen pondéré d'achat : capital investi ÷ quantité acquise.",
  capital:  'Valeur actuelle de votre portefeuille au prix de clôture de la dernière séance.',
  perf:     'Rendement net sur le capital investi : (Capital final − Investi) ÷ Investi × 100.',
}

export function ResultsGrid({ result, params }: ResultsGridProps) {
  const { capitalFinal, capitalInvesti, performance, nbPeriodes, quantiteAcquiseCumulee, prixMoyenAcquisition } = result
  const asset = getAsset(params.actif)
  const isGain = performance >= 0

  const periodeLabel = buildPeriodeLabel(nbPeriodes, params.frequence)

  return (
    <div>
      <h3 className={styles.sectionHeader}>Chiffres clés</h3>
      <div className={styles.grid}>

        <KpiCard
          label="Investi"
          info={KPI_INFO['investi']!}
          value={fmtEur(capitalInvesti)}
          {...(periodeLabel ? { subtitle: periodeLabel } : {})}
          color="var(--accent-secondary)"
        />

        <KpiCard
          label="Acquis"
          info={KPI_INFO['acquis']!}
          value={`${fmtCrypto(quantiteAcquiseCumulee)} ${asset?.symbol ?? ''}`}
          color="var(--accent-primary)"
        />

        <KpiCard
          label="Prix moyen d'acquisition"
          info={KPI_INFO['prix']!}
          value={fmtEur(prixMoyenAcquisition)}
          color="var(--text)"
        />

        <KpiCard
          label="Capital final"
          info={KPI_INFO['capital']!}
          value={fmtEur(capitalFinal)}
          color="var(--accent-primary)"
        />

        <div className={styles.gridFull}>
          <KpiCard
            label="Performance"
            info={KPI_INFO['perf']!}
            value={fmtPct(performance, true)}
            color={isGain ? 'var(--color-gain)' : 'var(--color-loss)'}
            large
          />
        </div>

      </div>
    </div>
  )
}

function buildPeriodeLabel(n: number, frequence: SimulationParams['frequence']): string {
  const unitMap: Record<SimulationParams['frequence'], [string, string]> = {
    mensuelle:    ['mois', 'mois'],
    hebdomadaire: ['semaine', 'semaines'],
    quotidienne:  ['jour', 'jours'],
  }
  const [singular, plural] = unitMap[frequence]
  return `en ${n} ${n > 1 ? plural : singular}`
}

interface KpiCardProps {
  readonly label: string
  readonly info: string
  readonly value: string
  readonly subtitle?: string
  readonly color: string
  readonly large?: boolean
}

function KpiCard({ label, info, value, subtitle, color, large = false }: KpiCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardLabelRow}>
        <p className={styles.cardLabel}>{label}</p>
        <FieldTooltip content={info} icon="i" position="top" />
      </div>
      <p
        className={`${styles.cardValue} ${large ? styles.cardValueLarge : ''}`}
        style={{ color }}
      >
        {value}
      </p>
      {subtitle && (
        <p className={styles.cardSubtitle}>{subtitle}</p>
      )}
    </div>
  )
}
