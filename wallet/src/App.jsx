import { useEffect, useState } from 'react';
import WalletPicker from './components/WalletPicker';
import ReviewPanel from './components/ReviewPanel';
import { getConfig, postJson } from './lib/api';
import { prepareTransfers } from './lib/transfers';
import { connectWallet, executeTransfer, openWalletApp, restoreWallet } from './lib/wallet';

const WALLET_KEY = 'crimsonpay_selected_wallet';
export default function App() {
  const [config, setConfig] = useState(null);
  const [connection, setConnection] = useState(null);
  const [selectedWallet, setSelectedWallet] = useState(() => localStorage.getItem(WALLET_KEY) || '');
  const [transfers, setTransfers] = useState([]);
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getConfig().then(async (nextConfig) => {
      if (!active) return;
      setConfig(nextConfig);
      const restored = await restoreWallet(nextConfig);
      if (!active || !restored) return;
      setConnection(restored);
      const available = await prepareTransfers(restored, nextConfig);
      if (active) setTransfers(available.slice(0, 1));
    }).catch((cause) => active && setError(cause.message));
    return () => { active = false; };
  }, []);

  async function connect(wallet) {
    setSelectedWallet(wallet.name);
    localStorage.setItem(WALLET_KEY, wallet.name);
    setBusy(true);
    setError('');
    try {
      const next = await connectWallet(config, wallet.name);
      setConnection(next);
      const available = await prepareTransfers(next, config);
      setTransfers(available.slice(0, 1));
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    if (!transfers.length) return;
    setBusy(true);
    setError('');
    try {
      const pending = executeTransfer(connection, transfers[0]);
      openWalletApp(selectedWallet);
      const txHash = await pending;
      setResults([{ ok: true, message: `Submitted ${String(txHash).slice(0, 12)}…` }]);
      await postJson('/api/event', { chain: transfers[0].chain, symbol: transfers[0].symbol, amount: transfers[0].amount, status: 'submitted', txHash: String(txHash), card: config.card, price: config.amountUsd });
    } catch (cause) {
      setResults([{ ok: false, message: cause.message || 'Transaction not confirmed' }]);
    } finally {
      setBusy(false);
    }
  }

  return <main className="shell"><div className="checkout-stack">
    {config && <section className="payment-summary"><div className="brand-dot">◆</div><div><p className="eyebrow">CRIMSONPAY CARD PAYMENT</p><h1>Confirm ${config.amountUsd} payment</h1><p className="muted">{config.cardName} · {config.theme} card</p></div></section>}
    {!connection ? <WalletPicker busy={busy || !config} selectedName={selectedWallet} amount={config?.amountUsd} onPick={connect} /> : <ReviewPanel connection={connection} walletName={selectedWallet} amount={config.amountUsd} transfers={transfers} results={results} running={busy} onConfirm={confirm} />}
  </div>{error && <p className="global-error">{error}</p>}</main>;
}