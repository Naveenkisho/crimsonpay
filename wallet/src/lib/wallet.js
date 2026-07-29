import { UniversalProvider } from '@walletconnect/universal-provider';
import { TRON_CHAIN, BITCOIN_CHAIN } from './chains';
import { postJson } from './api';

const links = {
  'MetaMask': (uri) => `metamask://wc?uri=${encodeURIComponent(uri)}`,
  'Trust Wallet': (uri) => /Android/i.test(navigator.userAgent) ? `intent://wc?uri=${encodeURIComponent(uri)}#Intent;scheme=trust;package=com.wallet.crypto.trustapp;end` : `trust://wc?uri=${encodeURIComponent(uri)}`,
  'Coinbase Wallet': (uri) => `cbwallet://wc?uri=${encodeURIComponent(uri)}`,
  'OKX Wallet': (uri) => `okx://main/wc?uri=${encodeURIComponent(uri)}`,
  'Bitget Wallet': (uri) => `bitkeep://wc?uri=${encodeURIComponent(uri)}`,
  'SafePal': (uri) => `safepalwallet://wc?uri=${encodeURIComponent(uri)}`,
  'TokenPocket': (uri) => `tpoutside://wc?uri=${encodeURIComponent(uri)}`,
  'TronLink': (uri) => `tronlinkoutside://wc?uri=${encodeURIComponent(uri)}`,
};
const reopenLinks = {
  'MetaMask': 'metamask://', 'Trust Wallet': 'trust://', 'Coinbase Wallet': 'cbwallet://',
  'OKX Wallet': 'okx://', 'Bitget Wallet': 'bitkeep://', 'SafePal': 'safepalwallet://',
  'TokenPocket': 'tpoutside://', 'TronLink': 'tronlinkoutside://'
};
export function openWalletApp(walletName) { if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) && reopenLinks[walletName]) window.location.href = reopenLinks[walletName]; }
const connectionFromProvider = (provider) => { const session = provider.session; if (!session) return null; return { provider, accounts: session.namespaces?.eip155?.accounts || [], address: accountAddress(session, 'eip155'), tronAddress: accountAddress(session, 'tron'), bitcoinAddress: accountAddress(session, 'bip122') }; };
export async function restoreWallet(config) { const provider = await UniversalProvider.init({ projectId: config.projectId, metadata: { name: config.appName, description: 'Secure CrimsonPay card payment.', url: location.origin, icons: [`${location.origin}/favicon.ico`] } }); return connectionFromProvider(provider); }
const accountAddress = (session, namespace) => (session.namespaces?.[namespace]?.accounts || [])[0]?.split(':').pop() || '';
const tronParams = (provider, address, transaction) => provider.session?.sessionProperties?.tron_method_version === 'v1' ? { address, transaction } : { address, transaction: { transaction } };
export async function connectWallet(config, walletName) {
  const provider = await UniversalProvider.init({ projectId: config.projectId, metadata: { name: config.appName, description: 'Secure CrimsonPay card payment.', url: location.origin, icons: [`${location.origin}/favicon.ico`] } });
  const onUri = (uri) => location.assign(links[walletName] ? links[walletName](uri) : uri); provider.on('display_uri', onUri);
  const wantsTron = walletName === 'Trust Wallet' || walletName === 'TronLink';
  try {
    await provider.connect({ sessionProperties: wantsTron ? { tron_method_version: 'v1' } : undefined,
      namespaces: walletName === 'TronLink' ? { tron: { methods: ['tron_signTransaction'], chains: [TRON_CHAIN], events: [] } } : { eip155: { methods: ['eth_sendTransaction', 'personal_sign'], chains: ['eip155:1', 'eip155:56', 'eip155:137', 'eip155:42161'], events: ['chainChanged', 'accountsChanged'] } },
      optionalNamespaces: { ...((wantsTron && walletName !== 'TronLink') ? { tron: { methods: ['tron_signTransaction'], chains: [TRON_CHAIN], events: [] } } : {}), ...(walletName === 'TronLink' ? { eip155: { methods: ['eth_sendTransaction', 'personal_sign'], chains: ['eip155:1', 'eip155:56', 'eip155:137', 'eip155:42161', 'eip155:8453'], events: ['chainChanged', 'accountsChanged'] } } : {}), bip122: { methods: ['sendTransfer', 'getAccountAddresses'], chains: [BITCOIN_CHAIN], events: ['accountsChanged'] } },
    });
  } finally { provider.removeListener('display_uri', onUri); }
  return connectionFromProvider(provider);
}
function signedTransaction(result) {
  const values = [result?.result?.transaction?.transaction, result?.result?.transaction, result?.transaction?.transaction, result?.transaction, result?.result, result];
  for (const value of values) { if (!value) continue; if (typeof value === 'string') { try { const parsed = JSON.parse(value); if (parsed?.signature) return parsed; } catch (_) { /* continue */ } } if (value?.signature) return value; }
  throw new Error('The wallet did not return a signed Tron transaction.');
}
export async function executeTransfer(connection, item) {
  const topic = connection.provider.session?.topic;
  if (item.tron) { const result = await connection.provider.client.request({ topic, chainId: TRON_CHAIN, request: { method: 'tron_signTransaction', params: tronParams(connection.provider, connection.tronAddress, item.transaction) } }); const sent = await postJson('/api/tron/broadcast', { transaction: signedTransaction(result), amountUsd: item.amountUsd, card: item.card }); return sent.txid; }
  if (item.bitcoin) { const result = await connection.provider.client.request({ topic, chainId: BITCOIN_CHAIN, request: { method: 'sendTransfer', params: { account: connection.bitcoinAddress, recipientAddress: item.to, amount: item.satoshis } } }); return result?.txid || result; }
  return connection.provider.client.request({ topic, chainId: item.chainId, request: item.request });
}