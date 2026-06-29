import { Simulateur } from '@/components/Simulateur'

export default function HomePage() {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', padding: '48px 24px 32px' }}>

      {/* Header centré — gabarit S'investir */}
      <header style={{ maxWidth: '720px', margin: '0 auto 48px', textAlign: 'center' }}>

        {/* Titre avec tirets dégradés — reproduction du gabarit S'investir */}
        <div className="page-header-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '18px' }}>
          {/* Ligne gauche : transparent → #1098F7 */}
          <svg width="64" height="2" viewBox="0 0 64 2" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="grad-left" x1="0" y1="0" x2="64" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1098F7" stopOpacity="0" />
                <stop offset="100%" stopColor="#1098F7" stopOpacity="1" />
              </linearGradient>
            </defs>
            <line x1="0" y1="1" x2="64" y2="1" stroke="url(#grad-left)" strokeWidth="2" />
          </svg>

          <h1 style={{
            fontSize: '26px',
            fontWeight: 800,
            color: 'var(--text)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            margin: 0,
            whiteSpace: 'nowrap',
          }}>
            Simulateur Crypto DCA
          </h1>

          {/* Ligne droite : #1098F7 → transparent */}
          <svg width="64" height="2" viewBox="0 0 64 2" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="grad-right" x1="0" y1="0" x2="64" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1098F7" stopOpacity="1" />
                <stop offset="100%" stopColor="#1098F7" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="0" y1="1" x2="64" y2="1" stroke="url(#grad-right)" strokeWidth="2" />
          </svg>
        </div>

        {/* Sous-titre bleu */}
        <p style={{
          fontSize: '17px',
          fontWeight: 500,
          color: 'var(--accent-secondary)',
          marginBottom: '16px',
          lineHeight: 1.5,
        }}>
          Simulez l'impact d'une stratégie DCA sur vos investissements crypto
        </p>

        {/* Description */}
        <p style={{
          fontSize: '14px',
          color: 'var(--text-muted)',
          lineHeight: 1.7,
          marginBottom: '24px',
        }}>
          Comment évolue votre portefeuille si vous investissez régulièrement dans Bitcoin, Ethereum ou d'autres cryptomonnaies ?
          Grâce aux données historiques CoinGecko, visualisez le capital accumulé, le prix moyen d'acquisition
          et la performance réelle de votre stratégie sur n'importe quelle période passée.
        </p>

        {/* Disclaimer */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '14px 18px',
          textAlign: 'left',
        }}>
          <span style={{
            flexShrink: 0,
            width: '15px',
            height: '15px',
            borderRadius: '50%',
            border: '1.5px solid var(--text-muted)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 700,
            color: 'var(--text-muted)',
            lineHeight: 1,
            marginTop: '2px',
          }}>
            i
          </span>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
            Cet outil a uniquement une vocation pédagogique et illustrative. Il ne constitue ni une prévision
            ni un conseil en investissement. Investir en crypto-actifs comporte un risque de perte en capital,
            partielle ou totale. Les performances passées ne préjugent pas des performances futures.
          </p>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Simulateur />
      </div>
    </div>
  )
}
