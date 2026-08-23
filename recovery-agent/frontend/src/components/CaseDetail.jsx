import { useEffect, useState } from "react";
import { getPaymentDetail } from "../api";

export default function CaseDetail({ paymentId, onClose }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (paymentId) getPaymentDetail(paymentId).then(setData);
  }, [paymentId]);

  if (!paymentId) return null;
  if (!data) return <div className="detail-panel">Loading...</div>;

  const { payment, logs } = data;

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <h2>{payment.customerName}</h2>
        <button onClick={onClose}>Close</button>
      </div>
      <p>
        ₹{(payment.amount / 100).toFixed(2)} · {payment.errorReason} · status: {payment.status}
      </p>
      {payment.newPaymentLink && (
        <p>
          Retry link:{" "}
          <a href={payment.newPaymentLink} target="_blank" rel="noreferrer">
            {payment.newPaymentLink}
          </a>
        </p>
      )}

      <h3>Audit trail</h3>
      {logs.length === 0 && <p>No recovery attempts yet.</p>}
      <ul className="audit-trail">
        {logs.map((log) => (
          <li key={log._id}>
            <div>
              <strong>Root cause:</strong> {log.rootCause} (confidence {log.confidence})
            </div>
            <div>
              <strong>Action:</strong> {log.recommendedAction} → executed: {log.executedAction} (
              {log.executionResult})
            </div>
            <div>
              <strong>Reasoning:</strong> {log.reasoning}
            </div>
            {log.draftMessage && (
              <div>
                <strong>Drafted message:</strong> {log.draftMessage}
              </div>
            )}
            <div className="log-timestamp">{new Date(log.createdAt).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
