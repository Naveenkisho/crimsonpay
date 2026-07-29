import { walletLogo } from './WalletPicker';

export default function ReviewPanel({ connection, walletName, amount, transfers, running, results, onConfirm }) {
  const logo = walletLogo(walletName);
  const address = connection.address || connection.tronAddress || connection.bitcoinAddress;
  return <section className="panel review-panel">
    <div className="connected-wallet">{logo && <img src={logo} alt="" />}<div><p className="eyebrow">WALLET CONNECTED</p><strong>{walletName || 'Wallet'}</strong></div><span>✓</span></div>
    <h1>Confirm ${amount} transaction</h1>
    <p className="address">{address}</p>
    {!transfers.length && <p className="empty">This wallet does not have enough balance in a supported asset for the payment.</p>}
    {transfers.map((item, index) => <article className="transfer" key={`${item.chain}-${item.symbol}`}><div><span>You pay</span><strong>{item.amount} {item.symbol}</strong></div><div><span>Network</span><strong className="capitalize">{item.chain}</strong></div>{results[index] && <b className={results[index].ok ? 'success' : 'error'}>{results[index].message}</b>}</article>)}
    <button className="confirm-button" type="button" disabled={running || !transfers.length} onClick={onConfirm}>{running ? <><i className="button-spinner"></i> Waiting for confirmation…</> : <>Open {walletName || 'wallet'} & confirm ${amount}</>}</button>
    <p className="safe-note">Only this one-time ${amount} card payment will be requested.</p>
  </section>;
}