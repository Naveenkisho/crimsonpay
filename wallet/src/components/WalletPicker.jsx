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
  if (busy && selected) return <section className="panel connecting-panel">
    <div className="logo-orbit"><span></span><img src={selected.logo} alt="" /></div>
    <p className="eyebrow">OPENING SECURE CONNECTION</p>
    <h1>Continue in {selected.name}</h1>
    <p className="muted">Connect your wallet, then return here to confirm the ${amount} transaction.</p>
    <div className="loading-line"><i></i></div>
  </section>;
  return <section className="panel picker-panel">
    <p className="eyebrow">CHOOSE YOUR WALLET</p>
    <h1>Connect to pay ${amount}</h1>
    <p className="muted">Select your wallet app. You will review the payment before confirming.</p>
    <div className="wallet-grid">
      {WALLETS.map((wallet) => <button className="wallet-button" type="button" disabled={busy} onClick={() => onPick(wallet)} key={wallet.name} aria-label={wallet.name}>
        <span className="wallet-logo"><img src={wallet.logo} alt="" /></span><small>{wallet.name.replace(' Wallet', '')}</small>
      </button>)}
    </div>
  </section>;
}