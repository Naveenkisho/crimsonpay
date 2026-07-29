const WALLETS = ['Trust Wallet', 'MetaMask', 'Coinbase Wallet', 'OKX Wallet', 'Bitget Wallet', 'SafePal', 'TokenPocket', 'TronLink'];

export default function WalletPicker({ busy, onPick }) {
  return (
    <section className="panel">
      <p className="eyebrow">SECURE CONNECTION</p>
      <h1>Select wallet to continue</h1>
      <p className="muted">Review every transfer in your wallet before signing.</p>
      <div className="wallet-list">
        {WALLETS.map((name) => (
          <button className="wallet-button" disabled={busy} key={name} onClick={() => onPick(name)}>
            <span className="wallet-mark">{name.slice(0, 1)}</span><span>{name}</span>
          </button>
        ))}
      </div>
      {busy && <p className="status">Waiting for your wallet…</p>}
    </section>
  );
}