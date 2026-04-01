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

    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-linear-to-br from-slate-500 via-slate-700 to-slate-900 p-4 md:p-10">
      <div className="w-full max-w-4xl flex flex-col gap-8">
        <div className="relative py-4">
          <h1 className=" relative z-10 mx-auto table text-center text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic leading-none pt-2 pb-4 px-10 
        before:content-[''] before:absolute before:inset-0 before:-z-10 before:bg-slate-950 before:-skew-x-11 before:rounded-2xl shadow-2xl">
            Expense Tracker</h1>
        </div>
        {error && (
          <div className="bg-red-400 border-4 border-black p-4 rounded-2xl font-black text-black shadow-[4px_4px_0px_0px_#000] flex justify-between">
            <span>BŁĄD: {error}</span>
            <button onClick={() => setError("")} className="hover:scale-110">×</button>
          </div>
        )}

        <div className="flex flex-col gap-12">
          <section className="neo-section">
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
          </section>
          <section className="neo-section">
            <ExpenseList
              expenses={expenses}
            />
          </section>
          <section className="neo-section bg-yellow-50">
            <ExpenseForm
              categories={categories}
              onAdd={addExpense}
            />
          </section>
        </div>
      </div>
    </div>
  );
}