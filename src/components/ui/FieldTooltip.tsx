'use client'

import { useState } from 'react'

interface FieldTooltipProps {
  readonly content: string
  /** Caractère affiché dans le cercle — '?' pour les champs de formulaire, 'i' pour les infos */
  readonly icon?: '?' | 'i'
  /** Position de la bulle — 'right' (défaut) pour le formulaire, 'top' pour les cartes */
  readonly position?: 'right' | 'top'
}

export function FieldTooltip({ content, icon = '?', position = 'right' }: FieldTooltipProps) {
  const [visible, setVisible] = useState(false)

  const bubbleStyle: React.CSSProperties = position === 'top'
    ? {
        position: 'absolute',
        bottom: 'calc(100% + 8px)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        background: 'var(--tooltip-bg)',
        color: 'var(--text)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '13px',
        lineHeight: 1.5,
        width: '220px',
        boxShadow: 'var(--card-shadow)',
        pointerEvents: 'none',
      }
    : {
        position: 'absolute',
        left: '24px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 100,
        background: 'var(--tooltip-bg)',
        color: 'var(--text)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '13px',
        lineHeight: 1.5,
        width: '220px',
        boxShadow: 'var(--card-shadow)',
        pointerEvents: 'none',
      }

  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: '6px' }}>
      <button
        type="button"
        aria-label={content}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        style={{
          width: '15px',
          height: '15px',
          borderRadius: '50%',
          border: '1.5px solid var(--text-muted)',
          background: 'transparent',
          color: 'var(--text-muted)',
          fontSize: '10px',
          fontWeight: 700,
          cursor: 'help',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
          flexShrink: 0,
          padding: 0,
        }}
      >
        {icon}
      </button>
      {visible && (
        <span role="tooltip" style={bubbleStyle}>
          {content}
        </span>
      )}
    </span>
  )
}
