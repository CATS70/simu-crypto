'use client'

import { useState } from 'react'
import styles from './FieldTooltip.module.css'

interface FieldTooltipProps {
  readonly content: string
  /** Caractère affiché dans le cercle — '?' pour les champs de formulaire, 'i' pour les infos */
  readonly icon?: '?' | 'i'
  /** Position de la bulle — 'right' (défaut) pour le formulaire, 'top' pour les cartes */
  readonly position?: 'right' | 'top'
}

export function FieldTooltip({ content, icon = '?', position = 'right' }: FieldTooltipProps) {
  const [visible, setVisible] = useState(false)

  return (
    <span className={styles.wrapper}>
      <button
        type="button"
        aria-label={content}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className={styles.trigger}
      >
        {icon}
      </button>
      {visible && (
        <span
          role="tooltip"
          className={`${styles.bubble} ${position === 'top' ? styles.bubbleTop : styles.bubbleRight}`}
        >
          {content}
        </span>
      )}
    </span>
  )
}
