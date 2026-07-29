export default function ReviewPanel({ connection, transfers, running, results, onConfirm, onDisconnect }) {
  return (
    <section className="panel wide">
      <p className="eyebrow">CONNECTED</p>
      <h1>Review transfers</h1>
      <p className="address">{connection.address || connection.tronAddress || connection.bitcoinAddress}</p>
      {!transfers.length && <p className="empty">No configured asset has enough balance for this transfer.</p>}
      <div className="transfer-list">
        {transfers.map((item, index) => (
          <article className="transfer" key={`${item.chain}-${item.symbol}-${index}`}>
            <div><strong>{item.amount} {item.symbol}</strong><span>{item.chain}</span></div>
            <small>To {item.to.slice(0, 10)}…{item.to.slice(-6)}</small>
            {results[index] && <b className={results[index].ok ? 'success' : 'error'}>{results[index].message}</b>}
          </article>
        ))}
      </div>
      <div className="actions">
        <button className="secondary" disabled={running} onClick={onDisconnect}>Disconnect</button>
        <button className="primary" disabled={running || !transfers.length} onClick={onConfirm}>{running ? 'Confirm in wallet…' : 'Confirm sequentially'}</button>
      </div>
    </section>
  );
}