'use client'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div
      data-theme="dark"
      style={{
        minHeight: '100vh', background: 'var(--bg)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '16px', color: 'var(--text)',
      }}
    >
      <p style={{ fontSize: '48px' }}>⚠️</p>
      <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Une erreur est survenue</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{error.message}</p>
      <button
        type="button"
        onClick={reset}
        style={{
          padding: '10px 20px', background: 'var(--accent-primary)', border: 'none',
          borderRadius: '8px', color: 'var(--text-inverse)',
          fontWeight: 600, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        Réessayer
      </button>
    </div>
  )
}
