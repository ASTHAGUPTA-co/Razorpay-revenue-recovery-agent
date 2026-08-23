import { useState } from "react";
import Queue from "./components/Queue.jsx";
import CaseDetail from "./components/CaseDetail.jsx";
import Metrics from "./components/Metrics.jsx";

export default function App() {
  const [selectedId, setSelectedId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="app">
      <header>
        <h1>Revenue Recovery Agent</h1>
        <p className="subtitle">AI diagnosis + bounded recovery actions on Razorpay test-mode</p>
      </header>

      <Metrics refreshKey={refreshKey} />

      <div className="main-grid">
        <Queue onSelect={setSelectedId} onChanged={() => setRefreshKey((k) => k + 1)} />
        {selectedId && <CaseDetail paymentId={selectedId} onClose={() => setSelectedId(null)} />}
      </div>
    </div>
  );
}
