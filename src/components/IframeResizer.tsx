'use client'

import { useEffect } from 'react'

export function IframeResizer() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = '/iframeResizer.contentWindow.min.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      if (document.body.contains(script)) script.remove()
    }
  }, [])
  return null
}
