'use client'

import { useState } from 'react'
import { FieldTooltip } from './ui/FieldTooltip'
import { CURATED_ASSETS } from '@/lib/assets'
import { SimulationParamsSchema } from '@/lib/validation'
import type { SimulationParams } from '@/types/simulation'

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
      montant: parseFloat(montant),
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Actif */}
        <div>
          <label htmlFor="actif" style={labelStyle}>
            Actif numérique
            <FieldTooltip content="Choisissez la cryptomonnaie sur laquelle baser la simulation." />
          </label>
          <select id="actif" value={actif} onChange={(e) => setActif(e.target.value)} style={inputStyle}>
            {CURATED_ASSETS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.symbol})
              </option>
            ))}
          </select>
          {errors['actif'] && <p style={errorStyle}>{errors['actif']}</p>}
        </div>

        {/* Montant */}
        <div>
          <label htmlFor="montant" style={labelStyle}>
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
            style={inputStyle}
          />
          {errors['montant'] && <p style={errorStyle}>{errors['montant']}</p>}
        </div>

        {/* Fréquence */}
        <div>
          <label htmlFor="frequence" style={labelStyle}>
            Fréquence
            <FieldTooltip content="À quel rythme investissez-vous ce montant ?" />
          </label>
          <select
            id="frequence"
            value={frequence}
            onChange={(e) => setFrequence(e.target.value as typeof frequence)}
            style={inputStyle}
          >
            <option value="quotidienne">Quotidienne</option>
            <option value="hebdomadaire">Hebdomadaire</option>
            <option value="mensuelle">Mensuelle</option>
          </select>
          {errors['frequence'] && <p style={errorStyle}>{errors['frequence']}</p>}
        </div>

        {/* Dates */}
        <div className="dates-grid">
          <div>
            <label htmlFor="dateDebut" style={labelStyle}>
              Depuis
              <FieldTooltip content="Date de début de la simulation (données historiques uniquement)." />
            </label>
            <input
              id="dateDebut"
              type="date"
              value={dateDebut}
              max={today}
              onChange={(e) => setDateDebut(e.target.value)}
              style={inputStyle}
            />
            {errors['dateDebut'] && <p style={errorStyle}>{errors['dateDebut']}</p>}
          </div>
          <div>
            <label htmlFor="dateFin" style={labelStyle}>
              Jusqu'au
              <FieldTooltip content="Date de fin de la simulation." />
            </label>
            <input
              id="dateFin"
              type="date"
              value={dateFin}
              max={today}
              onChange={(e) => setDateFin(e.target.value)}
              style={inputStyle}
            />
            {errors['dateFin'] && <p style={errorStyle}>{errors['dateFin']}</p>}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1, padding: '12px',
              background: loading ? 'var(--surface-elevated)' : 'var(--accent-primary)',
              border: 'none', borderRadius: '10px',
              color: 'var(--text-inverse)', fontWeight: 700,
              fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', transition: 'opacity 0.15s',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Calcul…' : 'Simuler'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: '12px 18px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              color: 'var(--text-muted)',
              fontSize: '14px',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Nouvelle simulation
          </button>
        </div>
      </div>
    </form>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center',
  fontSize: '13px', fontWeight: 500,
  color: 'var(--text-muted)', marginBottom: '6px',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px',
  background: 'var(--input-bg)',
  border: '1px solid var(--input-border)',
  borderRadius: '8px',
  color: 'var(--text)',
  fontSize: '14px',
  fontFamily: 'inherit',
  outline: 'none',
}

const errorStyle: React.CSSProperties = {
  marginTop: '4px', fontSize: '12px', color: 'var(--color-loss)',
}
