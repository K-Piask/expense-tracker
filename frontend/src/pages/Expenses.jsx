import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

const tagColors = [
    "bg-cyan-400",
    "bg-pink-400",
    "bg-lime-400",
    "bg-blue-400",
    "bg-purple-400",
    "bg-orange-400"
];

export default function Expenses() {
    const [error, setError] = useState("");
    const [categories, setCategories] = useState([]);
    const [shoppingLists, setShoppingLists] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [filterCategoryId, setFilterCategoryId] = useState("");
    const [filterFrom, setFilterFrom] = useState("");
    const [filterTo, setFilterTo] = useState("");

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formDate, setFormDate] = useState("");
    const [formCategoryId, setFormCategoryId] = useState("");
    const [formShoppingListId, setFormShoppingListId] = useState("");
    const [formNote, setFormNote] = useState("");

    const navigate = useNavigate();

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            return null;
        }
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };
    };

    const formatDate = (value) => {
        if (!value) return "-";
        const date = new Date(value);
        return new Intl.DateTimeFormat("pl-PL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).format(date);
    };

    const formatAmount = (value) => {
        const amount = Number(value) || 0;
        return amount.toFixed(2).replace(".", ",");
    };

    const sortedExpenses = useMemo(() => {
        return [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [expenses]);

    useEffect(() => {
        setError("");
        const headers = getAuthHeaders();
        if (!headers) {
            navigate("/login");
            return;
        }

        fetch(`${API}/api/categories`, { headers })
            .then((res) => {
                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem("token");
                    navigate("/login");
                    throw new Error("Wygasła sesja");
                }
                return res.json();
            })
            .then((data) => {
                setCategories(Array.isArray(data) ? data : []);
            })
            .catch(() => setError("Nie udało się pobrać kategorii"));
    }, [navigate]);

    useEffect(() => {
        setError("");
        const headers = getAuthHeaders();
        if (!headers) {
            navigate("/login");
            return;
        }

        fetch(`${API}/api/shopping-lists`, { headers })
            .then((res) => {
                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem("token");
                    navigate("/login");
                    throw new Error("Wygasła sesja");
                }
                return res.json();
            })
            .then((data) => {
                setShoppingLists(Array.isArray(data) ? data : []);
            })
            .catch(() => setError("Nie udało się pobrać list zakupów"));
    }, [navigate]);

    const fetchExpenses = async () => {
        const headers = getAuthHeaders();
        if (!headers) {
            navigate("/login");
            return;
        }

        const params = new URLSearchParams();
        if (filterCategoryId) params.append("categoryId", filterCategoryId);
        if (filterFrom) params.append("from", filterFrom);
        if (filterTo) params.append("to", filterTo);

        const url = `${API}/api/expenses${params.toString() ? `?${params.toString()}` : ""}`;

        try {
            setIsLoading(true);
            const res = await fetch(url, { headers });

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem("token");
                navigate("/login");
                throw new Error("Wygasła sesja");
            }

            const data = await res.json();
            setExpenses(Array.isArray(data) ? data : []);
        } catch {
            setError("Nie udało się pobrać wydatków");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [filterCategoryId, filterFrom, filterTo]);

    const clearFilters = () => {
        setFilterCategoryId("");
        setFilterFrom("");
        setFilterTo("");
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        setError("");

        if (!formDate) {
            setError("Data jest wymagana");
            return;
        }

        const headers = getAuthHeaders();
        if (!headers) {
            navigate("/login");
            return;
        }

        try {
            const res = await fetch(`${API}/api/expenses`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    date: formDate,
                    note: formNote || null,
                    categoryId: formCategoryId ? Number(formCategoryId) : null,
                    shoppingListId: formShoppingListId ? Number(formShoppingListId) : null
                }),
            });

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem("token");
                navigate("/login");
                throw new Error("Wygasła sesja");
            }

            if (!res.ok) {
                const text = await res.text();
                console.error("POST /api/expenses failed:", text);
                throw new Error("Nie udało się dodać wydatku");
            }

            const newExpense = await res.json();
            setIsAddModalOpen(false);
            setFormDate("");
            setFormShoppingListId("");
            setFormCategoryId("");
            setFormNote("");
            navigate(`/expense-details/${newExpense.id}`);
        } catch {
            setError("Nie udało się dodać wydatku");
        }
    };

    return (
        <div className="neo-page-shell">
            <div className="w-full max-w-5xl flex flex-col gap-6">
                <div className="relative py-1">
                    <h1 onClick={() => navigate("/home")} className="neo-brand-title cursor-pointer">
                        Expense Tracker
                    </h1>
                </div>

                {error && (
                    <div className="neo-alert">
                        <span className="text-xl">BŁĄD: {error}</span>
                        <button onClick={() => setError("")} className="hover:scale-110 text-3xl font-black leading-none pb-1">
                            ×
                        </button>
                    </div>
                )}

                <section className="neo-section">
                    <div className="flex justify-between items-center gap-4 flex-col md:flex-row">
                        <label className="neo-label text-3xl tracking-tight">Wydatki</label>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsFiltersOpen((prev) => !prev)}
                                className="neo-btn bg-slate-200 hover:bg-slate-100 px-8 py-3 text-lg md:text-xl uppercase"
                            >
                                {isFiltersOpen ? "Ukryj filtry" : "Filtry"}
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(true)}
                                className="neo-btn flex items-center gap-2 hover:bg-yellow-300 px-8 py-3 text-lg md:text-xl uppercase"
                            >
                                <span className="text-3xl leading-none -mt-1">+</span>
                                Dodaj
                            </button>
                        </div>
                    </div>
                    <div className="h-1 w-full bg-black shrink-0"></div>

                    {isFiltersOpen && (
                        <div className="border-4 border-black bg-slate-100 p-4 sm:p-5 rounded-2xl shadow-[4px_4px_0px_0px_#000]">
                            <div className="flex items-end justify-between gap-4 mb-4">
                                <h2 className="text-xl font-black uppercase tracking-tighter">Filtry</h2>
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="text-xs font-black uppercase tracking-widest underline"
                                >
                                    Wyczyść
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="flex flex-col">
                                    <label className="neo-label">Kategoria</label>
                                    <select
                                        className="neo-input w-full text-base md:text-xl"
                                        value={filterCategoryId}
                                        onChange={(e) => setFilterCategoryId(e.target.value)}
                                    >
                                        <option value="">(Wszystkie)</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col">
                                    <label className="neo-label text-blue-600">Data od</label>
                                    <input
                                        type="date"
                                        className="neo-input w-full text-base md:text-xl"
                                        value={filterFrom}
                                        onChange={(e) => setFilterFrom(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="neo-label text-red-600">Data do</label>
                                    <input
                                        type="date"
                                        className="neo-input w-full text-base md:text-xl"
                                        value={filterTo}
                                        onChange={(e) => setFilterTo(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="w-full flex justify-center my-5">
                        <div className="w-full max-w-4xl">
                            {isLoading ? (
                                <div className="text-center text-3xl font-black mt-10 mb-10 animate-pulse">
                                    Ładowanie wydatków...
                                </div>
                            ) : sortedExpenses.length === 0 ? (
                                <div className="neo-empty-state">
                                    <span className="text-4xl mb-4">💸</span>
                                    <span className="text-xl font-bold uppercase text-center">Brak wydatków.</span>
                                    <span className="text-sm font-black uppercase tracking-widest text-slate-500 mt-2">
                                        Dodaj wydatek przyciskiem Dodaj
                                    </span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                    {sortedExpenses.map((expense) => {
                                        const categoryName = expense.category?.name || "Brak kategorii";
                                        const stripeColorClass = expense.category
                                            ? tagColors[expense.category.id % tagColors.length]
                                            : "bg-slate-300";

                                        return (
                                            <button
                                                key={expense.id}
                                                type="button"
                                                onClick={() => navigate(`/expense-details/${expense.id}`)}
                                                className="group relative text-left w-full min-h-55 flex flex-col border-4 border-black bg-slate-100 shadow-[4px_4px_0px_0px_#000] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#000] transition-all duration-200 p-4"
                                            >
                                                <div className={`absolute left-0 top-0 h-full w-3 border-r-4 border-black ${stripeColorClass}`}></div>
                                                <div className="absolute left-3 top-0 bottom-0 w-0 border-l-4 border-dashed border-black/25"></div>

                                                <div className="pl-6 h-full flex flex-col justify-between grow">

                                                    <div className="flex flex-col gap-3">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="bg-black text-white px-3 py-1 border-2 border-black font-black text-xs uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                                                                {formatDate(expense.date)}
                                                            </span>
                                                            <span className={`${stripeColorClass} border-2 border-black px-3 py-1 font-black break-all text-sm uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]`}>
                                                                {categoryName}
                                                            </span>
                                                            {expense.shoppingListId && (
                                                                <span
                                                                    className="bg-yellow-300 border-2 border-black px-2.5 py-1 text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] flex items-center justify-center"
                                                                    title={expense.shoppingList?.name || "Powiązano z listą zakupów"}
                                                                >
                                                                    <span className="text-xl drop-shadow-[2px_2px_0px_#000]">📋✓</span>
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p className="font-bold text-lg text-slate-800 leading-tight wrap-break-word mt-2 truncate">
                                                            {expense.note || <span className="italic text-slate-400">Brak notatki</span>}
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-4 border-t-4 border-dashed border-black/25 mt-6">
                                                        <div className="font-bold">
                                                            <span className="text-md bg-white whitespace-nowrap px-2 py-1 border-2 border-black ">
                                                                {expense.expenseItems.length > 0 ? "Elementy: " + expense.expenseItems.length : "Brak elementów"}
                                                            </span>
                                                        </div>

                                                        <div className="text-right">
                                                            <div className="text-4xl font-black tracking-tighter leading-none text-black">
                                                                {formatAmount(expense.totalAmount)}
                                                            </div>
                                                            <div className="text-sm font-black uppercase tracking-widest text-slate-500 mt-1">
                                                                PLN
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>

            <div className="flex justify-center w-full mt-8">
                <button
                    type="button"
                    onClick={() => navigate("/home")}
                    className="bg-yellow-100 w-full max-w-xs neo-btn py-3 px-8 text-xl hover:bg-yellow-200"
                >
                    &#10094; Powrót
                </button>
            </div>

            {isAddModalOpen && (
                <div className="neo-modal-overlay">
                    <div className="neo-modal-container">
                        <div className="neo-modal-header">
                            <h2 className="neo-modal-title">Dodaj wydatek</h2>
                            <button
                                onClick={() => {
                                    setIsAddModalOpen(false);
                                    setFormDate("");
                                    setFormShoppingListId("");
                                    setFormCategoryId("");
                                    setFormNote("");
                                }}
                                className="neo-modal-close"
                                title="Zamknij"
                            >
                                X
                            </button>
                        </div>

                        <div className="neo-modal-content">
                            <form onSubmit={handleAddExpense} className="flex flex-col gap-4">
                                <div className="flex flex-col">
                                    <label className="neo-label">Data</label>
                                    <input
                                        type="date"
                                        className="neo-input w-full"
                                        value={formDate}
                                        onChange={(e) => setFormDate(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="neo-label">Kategoria</label>
                                    <select
                                        className="neo-input w-full"
                                        value={formCategoryId}
                                        onChange={(e) => setFormCategoryId(e.target.value)}
                                    >
                                        <option value="">(Brak kategorii)</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col">
                                    <label className="neo-label">Uzupełnij automatycznie z listy</label>
                                    <select
                                        className="neo-input w-full"
                                        value={formShoppingListId}
                                        onChange={(e) => setFormShoppingListId(e.target.value)}
                                    >
                                        <option value="">(Brak listy zakupów)</option>
                                        {shoppingLists.map((shoppingList) => (
                                            <option key={shoppingList.id} value={shoppingList.id}>
                                                {shoppingList.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col">
                                    <label className="neo-label">Notatka</label>
                                    <input
                                        type="text"
                                        className="neo-input w-full"
                                        placeholder="np. Zakupy spożywcze"
                                        value={formNote}
                                        onChange={(e) => setFormNote(e.target.value)}
                                    />
                                </div>

                                <div className="neo-modal-actions">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAddModalOpen(false);
                                            setFormDate("");
                                            setFormShoppingListId("");
                                            setFormCategoryId("");
                                            setFormNote("");
                                        }}
                                        className="neo-btn flex-1 bg-white hover:bg-slate-200"
                                    >
                                        Anuluj
                                    </button>
                                    <button
                                        type="submit"
                                        className="neo-btn flex-1 bg-green-400 hover:bg-green-500"
                                    >
                                        Dodaj
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}