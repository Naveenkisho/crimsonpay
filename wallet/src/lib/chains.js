export const EVM = {
  ethereum: { caip: 'eip155:1', rpc: 'https://ethereum-rpc.publicnode.com', token: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6, native: 'ETH', priceId: 'ethereum' },
  bsc: { caip: 'eip155:56', rpc: 'https://bsc-dataseed.binance.org', token: '0x55d398326f99059fF775485246999027B3197955', decimals: 18, native: 'BNB', priceId: 'binancecoin' },
  polygon: { caip: 'eip155:137', rpc: 'https://polygon-rpc.com', token: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6, native: 'POL', priceId: 'polygon-ecosystem-token' },
  arbitrum: { caip: 'eip155:42161', rpc: 'https://arb1.arbitrum.io/rpc', token: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', decimals: 6, native: 'ETH', priceId: 'ethereum' },
  base: { caip: 'eip155:8453', rpc: 'https://mainnet.base.org', token: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2', decimals: 6, native: 'ETH', priceId: 'ethereum' },
};
export const TRON_CHAIN = 'tron:0x2b6653dc';
export const BITCOIN_CHAIN = 'bip122:000000000019d6689c085ae165831e93';