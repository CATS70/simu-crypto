'use client'

import { useState, useRef } from 'react'
import type { SimulationParams } from '@/types/simulation'

interface SharePanelProps {
  readonly params: SimulationParams
  readonly resultsRef: React.RefObject<HTMLDivElement | null>
  readonly onClose: () => void
}

type ShareState = 'idle' | 'loading' | 'done' | 'error'

export function SharePanel({ params, resultsRef, onClose }: SharePanelProps) {
  const [state, setState] = useState<ShareState>('idle')
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const generateLink = async () => {
    setState('loading')
    setErrorMsg(null)
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      const data: unknown = await res.json()
      if (!res.ok || !isShareResponse(data)) {
        throw new Error(isErrorResponse(data) ? data.error : 'Erreur lors de la génération du lien.')
      }
      setShareUrl(data.url)
      setState('done')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur inconnue.')
      setState('error')
    }
  }

  const handleCopy = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      inputRef.current?.select()
      document.execCommand('copy')
    }
  }

  const handleDownloadImage = async () => {
    if (!resultsRef.current) return
    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(resultsRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#080C16',
      })
      const link = document.createElement('a')
      link.download = 'simulation-crypto.png'
      link.href = dataUrl
      link.click()
    } catch {
      alert('Impossible de générer l\'image. Essayez de réduire la fenêtre du navigateur.')
    }
  }

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '20px',
        marginTop: '8px',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Partager ma simulation</h3>
        <button type="button" onClick={onClose} style={closeBtnStyle} aria-label="Fermer le panneau de partage">
          ✕
        </button>
      </div>

      {state === 'idle' && (
        <button type="button" onClick={generateLink} style={primaryBtnStyle}>
          Générer le lien
        </button>
      )}

      {state === 'loading' && (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Génération du lien…</p>
      )}

      {state === 'error' && (
        <p style={{ color: 'var(--color-loss)', fontSize: '14px' }}>{errorMsg}</p>
      )}

      {state === 'done' && shareUrl && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              ref={inputRef}
              type="text"
              readOnly
              value={shareUrl}
              onFocus={(e) => e.target.select()}
              style={linkInputStyle}
              aria-label="Lien de partage"
            />
            <button type="button" onClick={handleCopy} style={secondaryBtnStyle}>
              {copied ? '✓ Copié' : 'Copier'}
            </button>
          </div>
          <button type="button" onClick={handleDownloadImage} style={secondaryBtnStyle}>
            ↓ Télécharger l'image
          </button>
        </div>
      )}
    </div>
  )
}

function isShareResponse(v: unknown): v is { url: string; id: string } {
  return typeof v === 'object' && v !== null && 'url' in v && typeof (v as { url: unknown }).url === 'string'
}

function isErrorResponse(v: unknown): v is { error: string } {
  return typeof v === 'object' && v !== null && 'error' in v && typeof (v as { error: unknown }).error === 'string'
}

const closeBtnStyle: React.CSSProperties = {
  background: 'transparent', border: 'none', cursor: 'pointer',
  color: 'var(--text-muted)', fontSize: '16px', padding: '2px 6px', lineHeight: 1,
}

const primaryBtnStyle: React.CSSProperties = {
  padding: '10px 20px', background: 'var(--accent-primary)', border: 'none',
  borderRadius: '8px', color: 'var(--text-inverse)', fontWeight: 600,
  fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', width: '100%',
}

const secondaryBtnStyle: React.CSSProperties = {
  padding: '8px 14px', background: 'var(--surface-elevated)',
  border: '1px solid var(--border)', borderRadius: '8px',
  color: 'var(--text)', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
  whiteSpace: 'nowrap',
}

const linkInputStyle: React.CSSProperties = {
  flex: 1, padding: '8px 12px', background: 'var(--input-bg)',
  border: '1px solid var(--border)', borderRadius: '8px',
  color: 'var(--text)', fontSize: '13px', fontFamily: 'inherit',
}
