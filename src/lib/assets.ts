import type { CuratedAsset } from '@/types/simulation'

export const CURATED_ASSETS: CuratedAsset[] = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
  { id: 'solana', name: 'Solana', symbol: 'SOL' },
  { id: 'binancecoin', name: 'BNB', symbol: 'BNB' },
  { id: 'ripple', name: 'XRP', symbol: 'XRP' },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA' },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE' },
  { id: 'polkadot', name: 'Polkadot', symbol: 'DOT' },
  { id: 'avalanche-2', name: 'Avalanche', symbol: 'AVAX' },
  { id: 'chainlink', name: 'Chainlink', symbol: 'LINK' },
  { id: 'matic-network', name: 'Polygon', symbol: 'POL' },
  { id: 'uniswap', name: 'Uniswap', symbol: 'UNI' },
  { id: 'litecoin', name: 'Litecoin', symbol: 'LTC' },
  { id: 'stellar', name: 'Stellar', symbol: 'XLM' },
  { id: 'cosmos', name: 'Cosmos', symbol: 'ATOM' },
  { id: 'near', name: 'NEAR Protocol', symbol: 'NEAR' },
  { id: 'aave', name: 'Aave', symbol: 'AAVE' },
  { id: 'tron', name: 'TRON', symbol: 'TRX' },
  { id: 'internet-computer', name: 'Internet Computer', symbol: 'ICP' },
  { id: 'algorand', name: 'Algorand', symbol: 'ALGO' },
]

export const ASSET_MAP = new Map(CURATED_ASSETS.map((a) => [a.id, a]))

export function getAsset(id: string): CuratedAsset | undefined {
  return ASSET_MAP.get(id)
}
