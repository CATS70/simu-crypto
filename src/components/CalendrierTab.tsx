'use client'

import type { SimulationEntry, CuratedAsset } from '@/types/simulation'
import styles from './CalendrierTab.module.css'

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
      <div className={styles.toolbar}>
        <button type="button" onClick={handleExportCSV} className={styles.exportBtn}>
          ↓ Exporter CSV
        </button>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {['Date', 'Investi', `Qté (${asset.symbol})`, 'Cumul investi', `Cumul (${asset.symbol})`, 'Prix', 'Valeur'].map((h) => (
                <th key={h} className={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.date + entry.montantInvestiCumule} className={styles.tr}>
                <td className={styles.td}>{entry.date}</td>
                <td className={styles.td}>{fmtEur(entry.montantInvesti)}</td>
                <td className={styles.td}>{fmt(entry.quantiteAcquise, 8)}</td>
                <td className={styles.td}>{fmtEur(entry.montantInvestiCumule)}</td>
                <td className={styles.td}>{fmt(entry.quantiteAcquiseCumulee, 8)}</td>
                <td className={styles.td}>{fmtEur(entry.prixDuJour)}</td>
                <td className={`${styles.td} ${entry.valeurCumulee >= entry.montantInvestiCumule ? styles.tdGain : styles.tdLoss}`}>
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
