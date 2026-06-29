import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      data-theme="dark"
      style={{
        minHeight: '100vh', background: 'var(--bg)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '16px', color: 'var(--text)',
      }}
    >
      <p style={{ fontSize: '48px' }}>🔍</p>
      <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Page introuvable</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Cette simulation n'existe pas ou a expiré.</p>
      <Link
        href="/"
        style={{
          padding: '10px 20px', background: 'var(--accent-primary)', border: 'none',
          borderRadius: '8px', color: 'var(--text-inverse)',
          fontWeight: 600, fontSize: '14px', textDecoration: 'none', fontFamily: 'inherit',
        }}
      >
        Retour à l'accueil
      </Link>
    </div>
  )
}
