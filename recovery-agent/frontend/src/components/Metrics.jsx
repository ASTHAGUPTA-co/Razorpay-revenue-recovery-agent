import { useEffect, useState } from "react";
import { getMetrics } from "../api";

export default function Metrics({ refreshKey }) {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    getMetrics().then(setMetrics);
  }, [refreshKey]);

  if (!metrics) return <p>Loading metrics...</p>;

  return (
    <div className="metrics-panel">
      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-value">{metrics.recoveryRate}</div>
          <div className="metric-label">Recovery rate</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">₹{metrics.amountRecoveredRupees}</div>
          <div className="metric-label">Amount recovered</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{metrics.recovered}</div>
          <div className="metric-label">Payments recovered</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{metrics.escalated}</div>
          <div className="metric-label">Escalated (exceptions)</div>
        </div>
      </div>

      {metrics.exceptions?.length > 0 && (
        <div className="exception-list">
          <h3>Honest exception list — cases the agent could not resolve</h3>
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Attempts</th>
              </tr>
            </thead>
            <tbody>
              {metrics.exceptions.map((e) => (
                <tr key={e._id}>
                  <td>{e.customerName}</td>
                  <td>₹{(e.amount / 100).toFixed(2)}</td>
                  <td>{e.errorReason}</td>
                  <td>{e.attempts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
