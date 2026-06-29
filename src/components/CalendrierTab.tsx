'use client'

import type { SimulationEntry, CuratedAsset } from '@/types/simulation'

const fmt = (v: number, decimals = 2) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v)

const fmtEur = (v: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(v)

interface CalendrierTabProps {
  readonly entries: SimulationEntry[]
  readonly asset: CuratedAsset
}

export function CalendrierTab({ entries, asset }: CalendrierTabProps) {
  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Montant investi (€)',
      `Quantité acquise (${asset.symbol})`,
      'Cumul investi (€)',
      `Cumul acquis (${asset.symbol})`,
      'Prix du jour (€)',
      'Valeur cumulée (€)',
    ]
    const rows = entries.map((e) => [
      e.date,
      e.montantInvesti.toFixed(2),
      e.quantiteAcquise.toFixed(8),
      e.montantInvestiCumule.toFixed(2),
      e.quantiteAcquiseCumulee.toFixed(8),
      e.prixDuJour.toFixed(2),
      e.valeurCumulee.toFixed(2),
    ])
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `calendrier-simulation-${asset.symbol.toLowerCase()}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button type="button" onClick={handleExportCSV} style={exportBtnStyle}>
          ↓ Exporter CSV
        </button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Date', 'Investi', `Qté (${asset.symbol})`, 'Cumul investi', `Cumul (${asset.symbol})`, 'Prix', 'Valeur'].map((h) => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.date + entry.montantInvestiCumule} style={trStyle}>
                <td style={tdStyle}>{entry.date}</td>
                <td style={tdStyle}>{fmtEur(entry.montantInvesti)}</td>
                <td style={tdStyle}>{fmt(entry.quantiteAcquise, 8)}</td>
                <td style={tdStyle}>{fmtEur(entry.montantInvestiCumule)}</td>
                <td style={tdStyle}>{fmt(entry.quantiteAcquiseCumulee, 8)}</td>
                <td style={tdStyle}>{fmtEur(entry.prixDuJour)}</td>
                <td style={{ ...tdStyle, color: entry.valeurCumulee >= entry.montantInvestiCumule ? 'var(--color-gain)' : 'var(--color-loss)' }}>
                  {fmtEur(entry.valeurCumulee)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '10px 12px',
  textAlign: 'right',
  fontWeight: 600,
  color: 'var(--text-muted)',
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  whiteSpace: 'nowrap',
}

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  textAlign: 'right',
  borderBottom: '1px solid var(--border)',
  whiteSpace: 'nowrap',
  color: 'var(--text)',
}

const trStyle: React.CSSProperties = {
  transition: 'background 0.15s',
}

const exportBtnStyle: React.CSSProperties = {
  padding: '8px 16px',
  background: 'var(--surface-elevated)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  color: 'var(--text)',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'inherit',
}
