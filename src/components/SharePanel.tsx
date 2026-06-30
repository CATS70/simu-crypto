'use client'

import { useState, useRef } from 'react'
import type { SimulationParams } from '@/types/simulation'
import styles from './SharePanel.module.css'

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
        quality: 1,
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
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>Partager ma simulation</h3>
        <button type="button" onClick={onClose} className={styles.closeBtn} aria-label="Fermer le panneau de partage">
          ✕
        </button>
      </div>

      {state === 'idle' && (
        <button type="button" onClick={generateLink} className={styles.primaryBtn}>
          Générer le lien
        </button>
      )}

      {state === 'loading' && (
        <p className={styles.hint}>Génération du lien…</p>
      )}

      {state === 'error' && (
        <p className={styles.errorMsg}>{errorMsg}</p>
      )}

      {state === 'done' && shareUrl && (
        <div className={styles.doneLayout}>
          <div className={styles.linkRow}>
            <input
              ref={inputRef}
              type="text"
              readOnly
              value={shareUrl}
              onFocus={(e) => e.target.select()}
              className={styles.linkInput}
              aria-label="Lien de partage"
            />
            <button type="button" onClick={handleCopy} className={styles.secondaryBtn}>
              {copied ? '✓ Copié' : 'Copier'}
            </button>
          </div>
          <button type="button" onClick={handleDownloadImage} className={styles.secondaryBtn}>
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
