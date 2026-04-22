/** Block explorer URL helpers for supported chains. */

export const SUPPORTED_CHAINS = ['ethereum', 'polygon', 'arbitrum', 'solana'] as const
export type SupportedChain = (typeof SUPPORTED_CHAINS)[number]

const EXPLORER_BASE: Record<SupportedChain, string> = {
  ethereum: 'https://etherscan.io/tx/',
  polygon: 'https://polygonscan.com/tx/',
  arbitrum: 'https://arbiscan.io/tx/',
  solana: 'https://solscan.io/tx/',
}

const CHAIN_LABELS: Record<SupportedChain, string> = {
  ethereum: 'Ethereum',
  polygon: 'Polygon',
  arbitrum: 'Arbitrum',
  solana: 'Solana',
}

export function getExplorerUrl(chain: string, txHash: string): string {
  const base = EXPLORER_BASE[chain as SupportedChain]
  if (!base) return '#'
  return `${base}${txHash}`
}

export function getChainLabel(chain: string): string {
  return CHAIN_LABELS[chain as SupportedChain] ?? chain
}

export function truncateTxHash(txHash: string): string {
  if (txHash.length <= 13) return txHash
  return `${txHash.slice(0, 6)}...${txHash.slice(-4)}`
}
