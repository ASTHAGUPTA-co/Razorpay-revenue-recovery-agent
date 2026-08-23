import { useEffect, useState } from "react";
import { getPayments, processPayment, processBatch, markRecovered } from "../api";

const STATUS_COLORS = {
  failed: "#94a3b8",
  recovering: "#f59e0b",
  recovered: "#22c55e",
  escalated: "#ef4444",
  abandoned: "#64748b",
};

export default function Queue({ onSelect, onChanged }) {
  const [payments, setPayments] = useState([]);
  const [busy, setBusy] = useState(false);

  async function load() {
    setPayments(await getPayments());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleProcessOne(id) {
    setBusy(true);
    await processPayment(id);
    await load();
    onChanged?.();
    setBusy(false);
  }

  async function handleBatch() {
    setBusy(true);
    await processBatch();
    await load();
    onChanged?.();
    setBusy(false);
  }

  async function handleMarkRecovered(id) {
    await markRecovered(id);
    await load();
    onChanged?.();
  }

  return (
    <div className="queue-panel">
      <div className="queue-header">
        <h2>Failed payments queue</h2>
        <button disabled={busy} onClick={handleBatch}>
          {busy ? "Processing..." : "Process all failed (batch)"}
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Amount</th>
            <th>Error</th>
            <th>Status</th>
            <th>Attempts</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p._id}>
              <td onClick={() => onSelect(p._id)} className="clickable">
                {p.customerName}
              </td>
              <td>₹{(p.amount / 100).toFixed(2)}</td>
              <td>{p.errorReason}</td>
              <td>
                <span className="status-badge" style={{ background: STATUS_COLORS[p.status] }}>
                  {p.status}
                </span>
              </td>
              <td>
                {p.attempts}/{p.maxAttempts}
              </td>
              <td>
                {p.status === "failed" && (
                  <button disabled={busy} onClick={() => handleProcessOne(p._id)}>
                    Process
                  </button>
                )}
                {p.status === "recovering" && (
                  <button onClick={() => handleMarkRecovered(p._id)}>Mark paid</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
