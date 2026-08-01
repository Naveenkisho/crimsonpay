export const WALLETS = [
  { name: 'Trust Wallet', logo: 'https://github.com/trustwallet.png' },
  { name: 'MetaMask', logo: 'https://github.com/MetaMask.png' },
  { name: 'Coinbase Wallet', logo: 'https://github.com/coinbase.png' },
  { name: 'OKX Wallet', logo: 'https://github.com/okx.png' },
  { name: 'Bitget Wallet', logo: 'https://github.com/bitgetwallet.png' },
  { name: 'SafePal', logo: 'https://github.com/SafePalWallet.png' },
  { name: 'TokenPocket', logo: 'https://github.com/TP-Lab.png' },
  { name: 'TronLink', logo: 'https://github.com/tronprotocol.png' }
];
export const walletLogo = (name) => WALLETS.find((wallet) => wallet.name === name)?.logo;

export default function WalletPicker({ busy, selectedName, amount, onPick }) {
  const selected = WALLETS.find((wallet) => wallet.name === selectedName);
  if (busy && selected) return <section className="panel connecting-panel premium-connect-panel">
    <div className="connect-brand"><span className="connect-brand-mark">C</span><b>CrimsonPay <i>×</i> Trust Wallet</b></div>
    <div className="logo-orbit"><span></span><img src={selected.logo} alt="" /></div>
    <p className="eyebrow">SECURE WALLET CONNECTION</p><h1>Continue in {selected.name}</h1>
    <p className="muted">Approve the connection in your wallet, then return here to review the ${amount} card payment.</p>
    <div className="loading-line"><i></i></div><p className="picker-security">Encrypted connection • You stay in control</p>
  </section>;
  return <section className="panel picker-panel premium-connect-panel">
    <div className="connect-brand"><span className="connect-brand-mark">C</span><b>CrimsonPay <i>×</i> Trust Wallet</b><span className="connect-step">1 of 2</span></div>
    <div className="picker-heading"><p className="eyebrow">SELECT YOUR WALLET</p><h1>Connect securely</h1><p className="muted">Choose your wallet to continue with the ${amount} card payment. Connection and signing remain inside your wallet.</p></div>
    <div className="wallet-grid">
      {WALLETS.map((wallet) => <button className="wallet-button" type="button" disabled={busy} onClick={() => onPick(wallet)} key={wallet.name} aria-label={`Connect with ${wallet.name}`}>
        <span className="wallet-logo"><img src={wallet.logo} alt="" /></span><span className="wallet-label"><strong>{wallet.name}</strong><small>Tap to connect</small></span><span className="wallet-arrow">→</span>
      </button>)}
    </div>
    <p className="picker-security"><span>◆</span> Non-custodial • No password or recovery phrase requested</p>
  </section>;
}
