'use client'

import { useEffect } from 'react'

export function ThemeApplier({ theme }: { readonly theme: string }) {
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
  return null
}
