import { useEffect, useState } from "react";
import Filters from "./components/Filters";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";

const API = "http://localhost:3000";

export default function App() {
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  // Kategorie
  useEffect(() => {
    fetch(`${API}/categories`)
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => setError("Nie udało się pobrać kategorii"));
  }, []);

  // Wydatki z filtrami
  const fetchExpenses = () => {
    const params = new URLSearchParams();
    if (filterCategoryId) params.append("categoryId", filterCategoryId);
    if (filterFrom) params.append("from", filterFrom);
    if (filterTo) params.append("to", filterTo);

    const qs = params.toString();
    const url = `${API}/expenses${qs ? `?${qs}` : ""}`;

    return fetch(url)
      .then((res) => res.json())
      .then(setExpenses)
      .catch(() => setError("Nie udało się pobrać wydatków"));
  };

  useEffect(() => {
    fetchExpenses();
  }, [filterCategoryId, filterFrom, filterTo]);

  // Dodawanie wydatku
  const addExpense = async (payload) => {
    setError("");

    const res = await fetch(`${API}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      setError("Nie udało się dodać wydatku");
      console.error("POST /expense failed:", errText);
      return false;
    }
    await fetchExpenses();
    return true;
  };

  const clearFilters = () => {
    setFilterCategoryId("");
    setFilterFrom("");
    setFilterTo("");
  };

  return (
    <div style={{ padding: 15, fontFamily: "sans-serif" }}>
      <h1>Expense Tracker</h1>

      {error && (
        <div style={{ background: "#4547FF", padding: 10, marginBottom: 10 }}>
          <b>Błąd:</b> {error}
        </div>
      )}

      <Filters
        categories={categories}
        filterCategoryId={filterCategoryId}
        setFilterCategoryId={setFilterCategoryId}
        filterFrom={filterFrom}
        setFilterFrom={setFilterFrom}
        filterTo={filterTo}
        setFilterTo={setFilterTo}
        onClear={clearFilters}
      />

      <ExpenseList
        expenses={expenses}
      />

      <ExpenseForm
        categories={categories}
        onAdd={addExpense}
      />
    </div>
  );
}