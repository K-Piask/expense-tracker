import { useEffect, useState } from "react";

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/health")
      .then((res) => res.json())
      .then(setData)
      .catch(() => setError("Nie udało się połączyć z backendem"));
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24 }}>
      <h1>Expense Tracker</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!data ? (
        <p>Ładowanie...</p>
      ) : (
        <>
          <p>Status backendu:</p>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </>
      )}
    </div>
  );
}