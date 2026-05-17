import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Filters from "../components/Filters";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";


const API = "http://localhost:3000";

export default function Dashboard() {
    const [error, setError] = useState("");
    const [categories, setCategories] = useState([]);
    const [expenses, setExpenses] = useState([]);

    const [filterCategoryId, setFilterCategoryId] = useState("");
    const [filterFrom, setFilterFrom] = useState("");
    const [filterTo, setFilterTo] = useState("");

    const navigate = useNavigate();

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            return null;
        }
        return {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        };
    };

    // Kategorie
    useEffect(() => {
        const headers = getAuthHeaders();
        if (!headers) {
            navigate("/login");
            return;
        }

        fetch(`${API}/api/categories`, { headers })
            .then((res) => {
                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    throw new Error("Wygasła sesja");
                }
                return res.json();
            })
            .then((data) => {
                if (Array.isArray(data)) {
                    setCategories(data);
                } else {
                    setCategories([]);
                }
            })
            .catch(() => setError("Nie udało się pobrać kategorii"));
    }, [navigate]);

    // Wydatki z filtrami
    const fetchExpenses = () => {
        const headers = getAuthHeaders();
        if (!headers) {
            navigate("/login");
            return Promise.resolve();
        }

        const params = new URLSearchParams();
        if (filterCategoryId) params.append("categoryId", filterCategoryId);
        if (filterFrom) params.append("from", filterFrom);
        if (filterTo) params.append("to", filterTo);

        const qs = params.toString();
        const url = `${API}/api/expenses${qs ? `?${qs}` : ""}`;

        return fetch(url, { headers })
            .then((res) => {
                if (res.status == 401 || res.status === 403) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    throw new Error("Wygasła sesja");
                }
                return res.json();
            })
            .then((data) => {
                if (Array.isArray(data)) {
                    setExpenses(data);
                } else {
                    setExpenses([]);
                }
            })
            .catch(() => setError("Nie udało się pobrać wydatków"));
    };

    useEffect(() => {
        fetchExpenses();
    }, [filterCategoryId, filterFrom, filterTo]);

    // Dodawanie wydatku
    const addExpense = async (payload) => {
        setError("");

        const headers = getAuthHeaders();
        if (!headers) {
            navigate("/login");
            return false;
        }

        try {
            const res = await fetch(`${API}/api/expenses`, {
                method: "POST",
                headers: headers,
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
        } catch (err) {
            return false;
        }
    };

    const clearFilters = () => {
        setFilterCategoryId("");
        setFilterFrom("");
        setFilterTo("");
    };


    return (

        <div className="flex flex-col items-center justify-center min-h-screen w-full bg-linear-to-br from-slate-500 via-slate-700 to-slate-900 p-4 md:p-10">
            <div className="w-full max-w-4xl flex flex-col gap-8">
                <div className="relative py-4" >
                    <h1 onClick={() => navigate('/home')} className="relative z-10 mx-auto table text-center text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic leading-none pt-2 pb-4 px-10 
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