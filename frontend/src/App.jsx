import { useEffect, useState } from "react";

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formNote, setFormNote] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/categories")
      .then((res) => res.json())
      .then((data) => {
        console.log("Kategorie z API:", data);
        setCategories(data);
      })
      .catch((err) => console.error("Błąd pobierania:"));
  }, []);


  const fetchExpenses = () => {
    const params = new URLSearchParams();

    if (filterCategoryId) params.append("categoryId", filterCategoryId);

    if (filterFrom) params.append("from", filterFrom);

    if (filterTo) params.append("to", filterTo);

    const qs = params.toString();
    const url = `http://localhost:3000/expenses${qs ? `?${qs}` : ""}`;
    return fetch(url)
      .then((res) => res.json())
      .then((data) => {
        console.log("Wydatki z API:", data);
        setExpenses(data);
      })
      .catch((err) => console.error(err));
  }

  useEffect(() => {
    fetchExpenses();
  }, [filterCategoryId, filterFrom, filterTo]);


  const handleAddExpense = async (e) => {
    e.preventDefault();

    //walidacja minimum
    if (!formAmount || !String(formAmount).trim()) return;
    if (!formDate) return;

    //zamiana zł na grosze
    const amountGrosze = Math.round(Number(formAmount) * 100);


    const body = {
      amount: amountGrosze,
      date: formDate,
      note: formNote || null,
      categoryId: formCategoryId ? Number(formCategoryId) : null,
    };

    const res = await fetch("http://localhost:3000/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("POST /expense failed:", errText);
      return;
    }

    // sukces -> czyścimy pola
    setFormAmount("");
    setFormDate("");
    setFormNote("");
    setFormCategoryId("");

    fetchExpenses();
  }

  return (
    /*<div style={{ fontFamily: "sans-serif", padding: 24 }}>
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
    </div>*/
    <div>


      <div><h1>Expense Tracker</h1>
        <h2>Kategorie: {categories.length}</h2>

        <select
          value={filterCategoryId}
          onChange={(e) => setFilterCategoryId(e.target.value)}
        >
          <option value="">(wszystkie)</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <div>
          <label>Od: </label><input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} />
          <label>Do: </label><input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} />
        </div>

        <h2>Wydatki: {expenses.length}</h2>
        <pre>{JSON.stringify(expenses, null, 2)}</pre>

      </div>

      <div><h2>Dodaj</h2>
        <form onSubmit={handleAddExpense} style={{ display: "grid", gap: 8, maxWidth: 420 }}>
          <input
            type="number"
            step="0.01"
            placeholder="Kwota (zł), np. 12.99"
            value={formAmount}
            onChange={(e) => setFormAmount(e.target.value)}
          />

          <input
            type="date"
            value={formDate}
            onChange={(e) => setFormDate(e.target.value)}
          />

          <input
            type="text"
            placeholder="Notatka (opcjonalnie)"
            value={formNote}
            onChange={(e) => setFormNote(e.target.value)}
          />
          <select value={formCategoryId} onChange={(e) => setFormCategoryId(e.target.value)}>
            <option value="">(brak kategorii)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button type="submit">Dodaj wydatek</button>
        </form>

      </div>
    </div>






  );
}