export default function FlowLoader({ show, logo, label }) {
  if (!show) return null;
  return <div className="flow-loader" role="status" aria-live="polite"><div className="flow-loader-card">
    <div className="flow-loader-ring">{logo ? <img src={logo} alt="" /> : <span className="flow-loader-mark">◆</span>}</div>
    <strong>{label}</strong><span>Approve in your wallet, then come back to finish payment</span>
  </div></div>;
}