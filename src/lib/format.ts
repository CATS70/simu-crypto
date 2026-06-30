// Formateur manuel — garantit U+00A0 comme séparateur de milliers
// indépendamment des données ICU disponibles dans Node.js (server components, WSL).
// Les client components peuvent utiliser Intl.NumberFormat directement (ICU toujours complet
// dans le navigateur). Voir DECISIONS.md pour le détail du compromis.
export function groupDigits(n: number, decimals: number): string {
  const [intPart, decPart = ''] = n.toFixed(decimals).split('.')
  const int = intPart!
  const groups: string[] = []
  for (let i = int.length; i > 0; i -= 3) {
    groups.unshift(int.slice(Math.max(0, i - 3), i))
  }
  const grouped = groups.join(' ')
  return decimals > 0 ? `${grouped},${decPart}` : grouped
}

export const fmtEur = (v: number): string => `${groupDigits(v, 2)} €`

export const fmtPct = (v: number, withSign = false): string => {
  const abs = groupDigits(Math.abs(v), 2)
  let sign: string
  if (v < 0) {
    sign = '−'
  } else if (withSign) {
    sign = '+'
  } else {
    sign = ''
  }
  return `${sign}${abs} %`
}

export const fmtCrypto = (v: number, decimals = 8): string => groupDigits(v, decimals)
