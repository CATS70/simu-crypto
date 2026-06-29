import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  async headers() {
    return [
      {
        // Security headers for all routes except /embed
        source: '/((?!embed$).*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // /embed: allow iframe embedding, no X-Frame-Options restriction (FR-033)
        source: '/embed',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Content-Security-Policy', value: "frame-ancestors *" },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default nextConfig
