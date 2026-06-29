import { Suspense } from 'react'
import { isValidTheme } from '@/lib/config'
import { Simulateur } from '@/components/Simulateur'
import { IframeResizer } from '@/components/IframeResizer'

interface EmbedPageProps {
  readonly searchParams: Promise<{ theme?: string }>
}

async function EmbedContent({ searchParams }: EmbedPageProps) {
  const { theme: rawTheme } = await searchParams
  const theme = rawTheme && isValidTheme(rawTheme) ? rawTheme : 'dark'

  return (
    <div data-theme={theme} style={{ background: 'var(--bg)', padding: '16px' }}>
      <Simulateur />
      <IframeResizer />
    </div>
  )
}

export default function EmbedPage(props: EmbedPageProps) {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#00173F' }} />}>
      <EmbedContent searchParams={props.searchParams} />
    </Suspense>
  )
}
