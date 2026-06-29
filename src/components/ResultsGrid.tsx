import type { SimulationResult, SimulationParams } from '@/types/simulation'
import { getAsset } from '@/lib/assets'
import { FieldTooltip } from './ui/FieldTooltip'

// Formateur manuel — garantit   comme séparateur de milliers
// indépendamment des données ICU disponibles dans Node.js / WSL.
function groupDigits(n: number, decimals: number): string {
  const [intPart, decPart = ''] = n.toFixed(decimals).split('.')
  const grouped = intPart!.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return decimals > 0 ? `${grouped},${decPart}` : grouped
}

const fmtEur = (v: number) => `${groupDigits(v, 2)} €`

const fmtPct = (v: number, withSign = false) => {
  const abs = groupDigits(Math.abs(v), 2)
  const sign = v < 0 ? '−' : withSign ? '+' : ''
  return `${sign}${abs} %`
}

const fmtCrypto = (v: number, decimals = 8) => groupDigits(v, decimals)

interface ResultsGridProps {
  readonly result: SimulationResult
  readonly params: SimulationParams
}

const KPI_INFO: Record<string, string> = {
  investi:  'Total des sommes versées sur la période, hors frais éventuels.',
  acquis:   'Quantité totale de l\'actif accumulée grâce aux achats périodiques.',
  prix:     'Coût moyen pondéré d\'achat : capital investi ÷ quantité acquise.',
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
      <h3 style={sectionHeaderStyle}>Chiffres clés</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>

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

        <div style={{ gridColumn: '1 / -1' }}>
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
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
        <p style={labelStyle}>{label}</p>
        <FieldTooltip content={info} icon="i" position="top" />
      </div>
      <p style={{ fontSize: large ? '30px' : '22px', fontWeight: 700, color, lineHeight: 1.2 }}>
        {value}
      </p>
      {subtitle && (
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{subtitle}</p>
      )}
    </div>
  )
}

const sectionHeaderStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--header-chiffres)',
  marginBottom: '12px',
  paddingBottom: '8px',
  borderBottom: '2px solid var(--header-chiffres)',
}

const cardStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '16px 20px',
  boxShadow: 'var(--card-shadow)',
}

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--text-muted)',
  margin: 0,
}
