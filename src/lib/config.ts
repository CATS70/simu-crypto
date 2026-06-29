const config = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  coinGeckoApiKey: process.env.COINGECKO_API_KEY,
  coinGeckoBaseUrl: 'https://api.coingecko.com/api/v3',
} as const

export const VALID_THEMES = ['dark', 'light'] as const
export type Theme = (typeof VALID_THEMES)[number]

export function isValidTheme(value: unknown): value is Theme {
  return VALID_THEMES.includes(value as Theme)
}

export default config
