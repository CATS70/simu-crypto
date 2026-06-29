interface BicolorBarProps {
  readonly capitalInvesti: number
  readonly capitalFinal: number
  readonly plusValue: number
}

export function BicolorBar({ capitalInvesti, capitalFinal, plusValue }: BicolorBarProps) {
  const isGain = plusValue >= 0

  // In gain case: bar = 100% of capitalFinal, split as capitalInvesti / plusValue
  // In loss case: bar = 100% of capitalFinal (< capitalInvesti), show full in blue + red text
  const investiPct = isGain ? (capitalFinal > 0 ? (capitalInvesti / capitalFinal) * 100 : 100) : 100
  const gainPct = isGain ? (capitalFinal > 0 ? (plusValue / capitalFinal) * 100 : 0) : 0

  return (
    <div>
      <div
        style={{
          height: '10px',
          borderRadius: '5px',
          overflow: 'hidden',
          background: 'var(--border)',
          display: 'flex',
        }}
      >
        <div
          style={{
            width: `${Math.min(investiPct, 100)}%`,
            background: 'var(--accent-secondary)',
            borderRadius: gainPct > 0 ? '5px 0 0 5px' : '5px',
            transition: 'width 0.5s ease',
          }}
        />
        {gainPct > 0 && (
          <div
            style={{
              width: `${Math.min(gainPct, 100)}%`,
              background: 'var(--color-gain)',
              borderRadius: '0 5px 5px 0',
              transition: 'width 0.5s ease',
            }}
          />
        )}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '8px',
          fontSize: '12px',
          color: 'var(--text-muted)',
          gap: '8px',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span
            style={{
              width: '10px', height: '10px', borderRadius: '2px',
              background: 'var(--accent-secondary)', flexShrink: 0,
            }}
          />
          Capital investi
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span
            style={{
              width: '10px', height: '10px', borderRadius: '2px',
              background: isGain ? 'var(--color-gain)' : 'var(--color-loss)', flexShrink: 0,
            }}
          />
          {isGain ? 'Plus-value' : 'Moins-value'}
          {!isGain && (
            <span style={{ color: 'var(--color-loss)', fontWeight: 500 }}>
              ({formatCurrency(plusValue)})
            </span>
          )}
        </span>
      </div>
    </div>
  )
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(value)
}
