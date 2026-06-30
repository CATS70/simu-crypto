'use client'

import { useState } from 'react'
import { FieldTooltip } from './ui/FieldTooltip'
import { CURATED_ASSETS } from '@/lib/assets'
import { SimulationParamsSchema } from '@/lib/validation'
import type { SimulationParams } from '@/types/simulation'
import styles from './SimulateurForm.module.css'

const today = new Date().toISOString().split('T')[0] as string
// Plan Demo CoinGecko : 365 jours max — on prend 364 pour avoir de la marge
const defaultStart = (() => {
  const d = new Date()
  d.setDate(d.getDate() - 364)
  return d.toISOString().split('T')[0] as string
})()

interface SimulateurFormProps {
  readonly initialParams?: Partial<SimulationParams>
  readonly onSubmit: (params: SimulationParams) => void
  readonly loading: boolean
}

export function SimulateurForm({ initialParams, onSubmit, loading }: SimulateurFormProps) {
  const [actif, setActif] = useState(initialParams?.actif ?? 'bitcoin')
  const [montant, setMontant] = useState(String(initialParams?.montant ?? 100))
  const [frequence, setFrequence] = useState<'quotidienne' | 'hebdomadaire' | 'mensuelle'>(
    initialParams?.frequence ?? 'mensuelle',
  )
  const [dateDebut, setDateDebut] = useState(initialParams?.dateDebut ?? defaultStart)
  const [dateFin, setDateFin] = useState(initialParams?.dateFin ?? today)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleReset = () => {
    setActif('bitcoin')
    setMontant('100')
    setFrequence('mensuelle')
    setDateDebut(defaultStart)
    setDateFin(today)
    setErrors({})
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const raw = {
      actif,
      montant: Number.parseFloat(montant),
      frequence,
      dateDebut,
      dateFin,
    }

    // FR-049 — validation côté client (miroir de la validation serveur)
    const parsed = SimulationParamsSchema.safeParse(raw)
    if (!parsed.success) {
      const newErrors: Record<string, string> = {}
      for (const issue of parsed.error.errors) {
        const key = issue.path[0] as string | undefined
        if (key) newErrors[key] = issue.message
      }
      setErrors(newErrors)
      return
    }

    onSubmit(parsed.data as SimulationParams)
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className={styles.formLayout}>

        {/* Actif */}
        <div>
          <label htmlFor="actif" className={styles.label}>
            Actif numérique
            <FieldTooltip content="Choisissez la cryptomonnaie sur laquelle baser la simulation." />
          </label>
          <select id="actif" value={actif} onChange={(e) => setActif(e.target.value)} className={styles.input}>
            {CURATED_ASSETS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.symbol})
              </option>
            ))}
          </select>
          {errors['actif'] && <p className={styles.error}>{errors['actif']}</p>}
        </div>

        {/* Montant */}
        <div>
          <label htmlFor="montant" className={styles.label}>
            Montant (€)
            <FieldTooltip content="Montant investi à chaque échéance." />
          </label>
          <input
            id="montant"
            type="number"
            min="0.01"
            step="any"
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
            placeholder="100"
            className={styles.input}
          />
          {errors['montant'] && <p className={styles.error}>{errors['montant']}</p>}
        </div>

        {/* Fréquence */}
        <div>
          <label htmlFor="frequence" className={styles.label}>
            Fréquence
            <FieldTooltip content="À quel rythme investissez-vous ce montant ?" />
          </label>
          <select
            id="frequence"
            value={frequence}
            onChange={(e) => setFrequence(e.target.value as typeof frequence)}
            className={styles.input}
          >
            <option value="quotidienne">Quotidienne</option>
            <option value="hebdomadaire">Hebdomadaire</option>
            <option value="mensuelle">Mensuelle</option>
          </select>
          {errors['frequence'] && <p className={styles.error}>{errors['frequence']}</p>}
        </div>

        {/* Dates */}
        <div className="dates-grid">
          <div>
            <label htmlFor="dateDebut" className={styles.label}>
              Depuis
              <FieldTooltip content="Date de début de la simulation (données historiques uniquement)." />
            </label>
            <input
              id="dateDebut"
              type="date"
              value={dateDebut}
              max={today}
              onChange={(e) => setDateDebut(e.target.value)}
              className={styles.input}
            />
            {errors['dateDebut'] && <p className={styles.error}>{errors['dateDebut']}</p>}
          </div>
          <div>
            <label htmlFor="dateFin" className={styles.label}>
              Jusqu'au
              <FieldTooltip content="Date de fin de la simulation." />
            </label>
            <input
              id="dateFin"
              type="date"
              value={dateFin}
              max={today}
              onChange={(e) => setDateFin(e.target.value)}
              className={styles.input}
            />
            {errors['dateFin'] && <p className={styles.error}>{errors['dateFin']}</p>}
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button type="submit" disabled={loading} className={styles.btnSubmit}>
            {loading ? 'Calcul…' : 'Simuler'}
          </button>
          <button type="button" onClick={handleReset} className={styles.btnReset}>
            Nouvelle simulation
          </button>
        </div>
      </div>
    </form>
  )
}
