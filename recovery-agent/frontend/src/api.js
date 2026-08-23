const BASE = "/api";

export async function getPayments() {
  const res = await fetch(`${BASE}/payments`);
  return res.json();
}

export async function getPaymentDetail(id) {
  const res = await fetch(`${BASE}/payments/${id}`);
  return res.json();
}

export async function processPayment(id) {
  const res = await fetch(`${BASE}/payments/${id}/process`, { method: "POST" });
  return res.json();
}

export async function processBatch() {
  const res = await fetch(`${BASE}/payments/process-batch`, { method: "POST" });
  return res.json();
}

export async function markRecovered(id) {
  const res = await fetch(`${BASE}/payments/${id}/mark-recovered`, { method: "POST" });
  return res.json();
}

export async function getMetrics() {
  const res = await fetch(`${BASE}/metrics`);
  return res.json();
}
