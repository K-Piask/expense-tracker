import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

const tagColors = [
    "bg-cyan-400",
    "bg-pink-400",
    "bg-lime-400",
    "bg-blue-400",
    "bg-purple-400",
    "bg-orange-400"
];

const stickyColors = [
    "bg-yellow-300",
    "bg-pink-300",
    "bg-green-300",
    "bg-blue-300",
    "bg-purple-300",
    "bg-orange-300"
];

const stickyRotations = [
    "-rotate-2",
    "rotate-2",
    "-rotate-1",
    "rotate-1",
    "-rotate-3",
    "rotate-3"
];



export default function ExpenseDetails() {
    const [expense, setExpense] = useState(null);
    const [categories, setCategories] = useState([]);
    const [shoppingLists, setShoppingLists] = useState([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null });
    const [itemModalConfig, setItemModalConfig] = useState({ isOpen: false, type: null, itemId: null });

    const [editDate, setEditDate] = useState("");
    const [editCategoryId, setEditCategoryId] = useState("");
    const [editShoppingListId, setEditShoppingListId] = useState("");
    const [editNote, setEditNote] = useState("");

    const [newItemName, setNewItemName] = useState("");
    const [newItemAmount, setNewItemAmount] = useState("");

    const [editItemName, setEditItemName] = useState("");
    const [editItemAmount, setEditItemAmount] = useState("");

    const { id } = useParams();
    const navigate = useNavigate();

    const parsedId = parseInt(expense?.shoppingListId, 10) || 0;
    const bgColor = stickyColors[parsedId % stickyColors.length];
    const rotation = stickyRotations[parsedId % stickyRotations.length];

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        if (!token) return null;
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };
    };

    const formatDate = (value) => {
        if (!value) return "-";
        return new Intl.DateTimeFormat("pl-PL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).format(new Date(value));
    };

    const formatAmount = (value) => {
        const amount = Number(value) || 0;
        return amount.toFixed(2).replace(".", ",");
    };

    const expenseItems = useMemo(() => {
        const items = expense?.expenseItems || [];
        return [...items].sort((a, b) => Number(a.id) - Number(b.id));
    }, [expense]);

    const shoppingListItems = useMemo(() => {
        const items = expense?.shoppingList?.shoppingListItems || [];
        return [...items].sort((a, b) => Number(a.id) - Number(b.id));
    }, [expense]);

    const shoppingListOptions = useMemo(() => {
        const options = [...shoppingLists];

        if (expense?.shoppingList && !options.some((item) => item.id === expense.shoppingList.id)) {
            options.unshift(expense.shoppingList);
        }

        return options;
    }, [shoppingLists, expense]);

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

    useEffect(() => {
        const headers = getAuthHeaders();
        if (!headers) {
            navigate("/login");
            return;
        }

        setIsLoading(true);
        fetch(`${API}/api/expenses/${id}`, { headers })
            .then((res) => {
                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem("token");
                    navigate("/login");
                    throw new Error("Wygasła sesja");
                }
                return res.json();
            })
            .then((data) => {
                setExpense(data);
                setEditDate(data?.date ? String(data.date).slice(0, 10) : "");
                setEditCategoryId(data?.categoryId ? String(data.categoryId) : "");
                setEditShoppingListId(data?.shoppingListId ? String(data.shoppingListId) : "");
                setEditNote(data?.note || "");
                setIsLoading(false);
            })
            .catch(() => {
                setError("Nie udało się pobrać wydatku");
                setIsLoading(false);
            });
    }, [id, navigate]);

    const refreshExpense = async () => {
        const headers = getAuthHeaders();
        if (!headers) {
            navigate("/login");
            return;
        }

        const res = await fetch(`${API}/api/expenses/${id}`, { headers });
        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("token");
            navigate("/login");
            return;
        }
        const data = await res.json();
        setExpense(data);
    };

    const handleEditExpense = async (e) => {
        e.preventDefault();
        const headers = getAuthHeaders();
        if (!headers) {
            navigate("/login");
            return;
        }

        try {
            const res = await fetch(`${API}/api/expenses/${id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify({
                    date: editDate,
                    note: editNote || null,
                    categoryId: editCategoryId ? Number(editCategoryId) : null,
                    expenseItems: expenseItems.map((item) => ({
                        id: item.id,
                        name: item.name,
                        amount: Number(item.amount),
                    })),
                    shoppingListId: editShoppingListId ? Number(editShoppingListId) : null,
                }),
            });

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem("token");
                navigate("/login");
                throw new Error("Wygasła sesja");
            }

            if (!res.ok) {
                throw new Error("Nie udało się zaktualizować wydatku");
            }

            const updatedExpense = await res.json();
            setExpense((prev) => ({
                ...prev,
                ...updatedExpense,
            }));
            setModalConfig({ isOpen: false, type: null });
        } catch {
            setError("Nie udało się zaktualizować wydatku");
        }
    };

    const handleDeleteExpense = async () => {
        const headers = getAuthHeaders();
        if (!headers) {
            navigate("/login");
            return;
        }

        try {
            const res = await fetch(`${API}/api/expenses/${id}`, {
                method: "DELETE",
                headers,
            });

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem("token");
                navigate("/login");
                throw new Error("Wygasła sesja");
            }

            if (!res.ok) {
                throw new Error("Nie udało się usunąć wydatku");
            }

            navigate("/expenses");
        } catch {
            setError("Nie udało się usunąć wydatku");
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItemName.trim()) return;

        const headers = getAuthHeaders();
        if (!headers) {
            navigate("/login");
            return;
        }

        const nextItems = [
            ...expenseItems,
            {
                name: newItemName.trim(),
                amount: Number(newItemAmount) || 0,
            },
        ];

        try {
            const res = await fetch(`${API}/api/expenses/${id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify({
                    date: editDate || String(expense?.date || "").slice(0, 10),
                    note: editNote || null,
                    categoryId: editCategoryId ? Number(editCategoryId) : null,
                    expenseItems: nextItems,
                    shoppingListId: editShoppingListId ? Number(editShoppingListId) : null,
                }),
            });

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem("token");
                navigate("/login");
                throw new Error("Wygasła sesja");
            }

            if (!res.ok) {
                throw new Error("Nie udało się dodać produktu");
            }

            const updated = await res.json();
            setExpense((prev) => ({
                ...prev,
                ...updated,
            }));
            setItemModalConfig({ isOpen: false, type: null, itemId: null });
            setNewItemName("");
            setNewItemAmount("");
        } catch {
            setError("Nie udało się dodać produktu");
        }
    };

    const handleEditItem = async (e) => {
        e.preventDefault();
        if (!editItemName.trim()) return;

        const headers = getAuthHeaders();
        if (!headers) {
            navigate("/login");
            return;
        }

        const nextItems = expenseItems.map((item) =>
            item.id === itemModalConfig.itemId
                ? {
                    ...item,
                    name: editItemName.trim(),
                    amount: Number(editItemAmount) || 0,
                }
                : item
        );

        try {
            const res = await fetch(`${API}/api/expenses/${id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify({
                    date: editDate || String(expense?.date || "").slice(0, 10),
                    note: editNote || null,
                    categoryId: editCategoryId ? Number(editCategoryId) : null,
                    expenseItems: nextItems.map((item) => ({
                        id: item.id,
                        name: item.name,
                        amount: Number(item.amount),
                    })),
                    shoppingListId: editShoppingListId ? Number(editShoppingListId) : null,
                }),
            });

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem("token");
                navigate("/login");
                throw new Error("Wygasła sesja");
            }

            if (!res.ok) {
                throw new Error("Nie udało się zaktualizować produktu");
            }

            const updated = await res.json();
            setExpense((prev) => ({
                ...prev,
                ...updated,
            }));
            setItemModalConfig({ isOpen: false, type: null, itemId: null });
            setEditItemName("");
            setEditItemAmount("");
        } catch {
            setError("Nie udało się zaktualizować produktu");
        }
    };

    const handleDeleteItem = async (itemId) => {
        const headers = getAuthHeaders();
        if (!headers) {
            navigate("/login");
            return;
        }

        const nextItems = expenseItems.filter((item) => item.id !== itemId);

        try {
            const res = await fetch(`${API}/api/expenses/${id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify({
                    date: editDate || String(expense?.date || "").slice(0, 10),
                    note: editNote || null,
                    categoryId: editCategoryId ? Number(editCategoryId) : null,
                    expenseItems: nextItems.map((item) => ({
                        id: item.id,
                        name: item.name,
                        amount: Number(item.amount),
                    })),
                    shoppingListId: editShoppingListId ? Number(editShoppingListId) : null,
                }),
            });

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem("token");
                navigate("/login");
                throw new Error("Wygasła sesja");
            }

            if (!res.ok) {
                throw new Error("Nie udało się usunąć produktu");
            }

            const updated = await res.json();
            setExpense((prev) => ({
                ...prev,
                ...updated,
            }));
        } catch {
            setError("Nie udało się usunąć produktu");
        }
    };

    const totalAmount = useMemo(() => {
        return expenseItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    }, [expenseItems]);

    const openEditItemModal = (item) => {
        setEditItemName(item.name);
        setEditItemAmount(String(item.amount ?? ""));
        setItemModalConfig({ isOpen: true, type: "edit-item", itemId: item.id });
    };
    const stripeColorClass = expense?.category
        ? tagColors[expense.category.id % tagColors.length]
        : "bg-slate-300";
    return (
        <div className="neo-page-shell">
            <div className="w-full max-w-5xl flex flex-col gap-6">
                <div className="relative py-1">
                    <h1 onClick={() => navigate("/home")} className="neo-brand-title">
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
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-4">
                        <div className="flex flex-col gap-2">
                            <span className="bg-black text-white px-3 py-1 border-2 border-black font-black text-sm uppercase tracking-widest w-fit">
                                {formatDate(expense?.date)}
                            </span>
                            <div className="flex gap-2">
                                <span className="text-3xl sm:text-4xl font-black uppercase tracking-tighter">
                                    Wydatek
                                </span>


                                {expense?.category?.name && (
                                    <div className="flex gap-2 flex-wrap">

                                        <span className="text-3xl sm:text-4xl font-black uppercase tracking-tighter">
                                            w kat.
                                        </span>
                                        <span className={`${stripeColorClass} border-3 border-black px-4 py-2 font-black wrap-break-word text-sm sm:text-lg uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]`}>
                                            {expense.category.name}
                                        </span>
                                    </div>
                                )}

                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setItemModalConfig({ isOpen: true, type: "add-item", itemId: null })}
                            className="neo-btn flex items-center gap-2 px-8 py-3 text-xl uppercase md:self-auto self-center"
                        >
                            <span className="text-3xl leading-none -mt-1">+</span>
                            Dodaj
                        </button>
                    </div>



                    <div className="h-1 w-full bg-black shrink-0"></div>

                    {isLoading ? (
                        <div className="text-center text-3xl font-black mt-10 mb-10 animate-pulse">
                            Ładowanie wydatku...
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-4">
                                {expenseItems.length === 0 ? (
                                    <div className="neo-empty-state">
                                        <span className="text-4xl mb-4">🧾</span>
                                        <span className="text-xl font-bold uppercase text-center">
                                            Brak produktów w wydatku.
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        {expenseItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="group relative border-4 border-black bg-slate-100 shadow-[4px_4px_0px_0px_#000] p-4"
                                            >
                                                <div className={`absolute left-0 top-0 h-full w-3 ${stripeColorClass} border-r-4 border-black`}></div>

                                                <div className="pl-6 flex flex-col md:flex-row items-center gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter wrap-break-word">
                                                                {item.name}
                                                            </h3>
                                                            <span className="text-2xl sm:text-3xl font-black tracking-tighter">
                                                                {formatAmount(item.amount)}
                                                                <span className="text-sm font-black uppercase ml-1">PLN</span>
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditItemModal(item)}
                                                            className="w-10 h-10 border-4 border-black bg-yellow-300 hover:bg-yellow-200 font-black text-xl shadow-[2px_2px_0px_0px_#000] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
                                                            title="Edytuj produkt"
                                                        >
                                                            ✎
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteItem(item.id)}
                                                            className="w-10 h-10 border-4 border-black bg-red-400 hover:bg-red-500 font-black text-xl shadow-[2px_2px_0px_0px_#000] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
                                                            title="Usuń produkt"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between gap-4 mt-5">
                                <div className="text-right">
                                    <div className="text-sm font-black uppercase tracking-widest text-slate-500">
                                        Łączna kwota
                                    </div>
                                    <div className="text-4xl font-black tracking-tighter">
                                        {formatAmount(totalAmount)}
                                        <span className="text-sm sm:text-base font-black uppercase ml-2">PLN</span>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row gap-4 w-auto ">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditDate(String(expense?.date || "").slice(0, 10));
                                            setEditCategoryId(expense?.categoryId ? String(expense.categoryId) : "");
                                            setEditShoppingListId(expense?.shoppingListId ? String(expense.shoppingListId) : "");
                                            setEditNote(expense?.note || "");
                                            setModalConfig({ isOpen: true, type: "edit-expense" });
                                        }}
                                        className="neo-btn bg-green-400 hover:bg-green-500 px-3 md:px-8 md:py-3 text-base md:text-lg"
                                    >
                                        Edytuj
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setModalConfig({ isOpen: true, type: "delete-expense" })}
                                        className="neo-btn bg-red-400 hover:bg-red-500 px-3 md:px-8 md:py-3 text-base md:text-lg"
                                    >
                                        Usuń
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {expense?.note && (
                    <section className="neo-section">
                        <label className="neo-label text-2xl tracking-tight">Notatka</label>
                        <div className="h-1 w-full bg-black shrink-0"></div>


                        <p className="text-lg sm:text-xl font-bold italic text-slate-800 leading-relaxed">
                            {expense.note}
                        </p>

                    </section>

                )}


                {expense?.shoppingListId && (
                    <section className="neo-section">
                        <label className="neo-label text-2xl tracking-tight">Oryginalna lista zakupów</label>
                        <div className="h-1 w-full bg-black shrink-0"></div>


                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between gap-4">
                                <h2 className={`relative z-10 inline-block w-fit max-w-full text-xl font-black uppercase tracking-tighter border-4 border-black px-4 py-2 shadow-[4px_4px_0px_0px_#000] wrap-break-word transition-all ${bgColor} ${rotation}`}>
                                    {isLoading ? "Ładowanie..." : expense?.shoppingList?.name}
                                </h2>
                                {expense?.shoppingList?.isDone && shoppingListItems.length > 0 && (
                                    <span className="bg-green-400 border-2 border-black px-3 py-1 font-black text-xs uppercase tracking-widest">
                                        Zakończona
                                    </span>
                                )}
                            </div>

                            {shoppingListItems.length === 0 ? (
                                <div className="neo-empty-state">
                                    <span className="text-5xl mb-4">🕵️‍♂️</span>
                                    <span className="text-xl font-bold uppercase text-center">
                                        Brak produktów na wybranej liście.
                                    </span>
                                    <span className="text-sm font-black text-center uppercase tracking-widest text-slate-500 mt-2">Dodaj produkty ręcznie lub edytuj wydatek, aby zmienić listę</span>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {shoppingListItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="border-4 border-black bg-slate-100 shadow-[4px_4px_0px_0px_#000] p-4 sm:p-5"
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-lg sm:text-xl font-black uppercase tracking-tighter wrap-break-word">
                                                    {item.name}
                                                </span>
                                                <span className="text-sm font-black uppercase tracking-widest text-slate-500">
                                                    {item.isBought ? "Kupione" : "Niezakupione"}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>)}
                        </div>

                    </section>
                )}

                <div className="flex justify-center w-full mt-2">
                    <button
                        type="button"
                        onClick={() => navigate("/expenses")}
                        className="bg-yellow-100 w-full max-w-xs neo-btn py-3 px-8 text-xl hover:bg-yellow-200"
                    >
                        &#10094; Powrót
                    </button>
                </div>
            </div>

            {modalConfig.isOpen && (
                <div className="neo-modal-overlay">
                    <div className="neo-modal-container">
                        <div className="neo-modal-header">
                            <h2 className="neo-modal-title">
                                {modalConfig.type === "edit-expense" && "Edytuj wydatek"}
                                {modalConfig.type === "delete-expense" && "Usuń wydatek"}
                            </h2>
                            <button
                                onClick={() => setModalConfig({ isOpen: false, type: null })}
                                className="neo-modal-close"
                                title="Zamknij"
                            >
                                X
                            </button>
                        </div>

                        <div className="neo-modal-content">
                            {modalConfig.type === "edit-expense" && (
                                <form onSubmit={handleEditExpense} className="flex flex-col gap-4">
                                    <div className="flex flex-col">
                                        <label className="neo-label">Data</label>
                                        <input
                                            type="date"
                                            className="neo-input w-full"
                                            value={editDate}
                                            onChange={(e) => setEditDate(e.target.value)}
                                        />
                                    </div>



                                    <div className="flex flex-col">
                                        <label className="neo-label">Kategoria</label>
                                        <select
                                            className="neo-input w-full"
                                            value={editCategoryId}
                                            onChange={(e) => setEditCategoryId(e.target.value)}
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
                                            value={editShoppingListId}
                                            onChange={(e) => setEditShoppingListId(e.target.value)}
                                        >
                                            <option value="">(Brak listy zakupów)</option>
                                            {shoppingListOptions.map((shoppingList) => (
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
                                            value={editNote}
                                            onChange={(e) => setEditNote(e.target.value)}
                                        />
                                    </div>

                                    <div className="neo-modal-actions">
                                        <button
                                            type="button"
                                            onClick={() => setModalConfig({ isOpen: false, type: null })}
                                            className="neo-btn flex-1 bg-white hover:bg-slate-200"
                                        >
                                            Anuluj
                                        </button>
                                        <button
                                            type="submit"
                                            className="neo-btn flex-1 bg-green-400 hover:bg-green-500"
                                        >
                                            Zapisz
                                        </button>
                                    </div>
                                </form>
                            )}

                            {modalConfig.type === "delete-expense" && (
                                <div className="flex flex-col gap-4">
                                    <div className="bg-slate-100 border-4 border-dashed border-black p-6 text-xl font-bold uppercase tracking-tight text-center">
                                        Czy na pewno usunąć wydatek z dnia<br />
                                        <span className="inline-block max-w-full break-all bg-yellow-200 border-2 border-black px-2 py-1 mt-2">
                                            {formatDate(expense?.date)}
                                        </span>
                                        {expense?.shoppingList ? (
                                            <span className="block mt-2">
                                                oraz przypisaną listę zakupów?
                                            </span>
                                        ) : (
                                            "?"
                                        )}
                                        <span className="block mt-4 text-sm text-black/60">Tej akcji nie da się cofnąć!</span>
                                    </div>

                                    <div className="neo-modal-actions">
                                        <button
                                            type="button"
                                            onClick={() => setModalConfig({ isOpen: false, type: null })}
                                            className="neo-btn flex-1 bg-white hover:bg-slate-200"
                                        >
                                            Anuluj
                                        </button>
                                        <button
                                            onClick={handleDeleteExpense}
                                            className="neo-btn flex-1 bg-red-500 hover:bg-red-600 text-black"
                                        >
                                            TAK, USUŃ!
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {itemModalConfig.isOpen && (
                <div className="neo-modal-overlay">
                    <div className="neo-modal-container">
                        <div className="neo-modal-header">
                            <h2 className="neo-modal-title">
                                {itemModalConfig.type === "add-item" && "Dodaj produkt"}
                                {itemModalConfig.type === "edit-item" && "Edytuj produkt"}
                            </h2>
                            <button
                                onClick={() => {
                                    setItemModalConfig({ isOpen: false, type: null, itemId: null });
                                    setNewItemName("");
                                    setNewItemAmount("");
                                    setEditItemName("");
                                    setEditItemAmount("");
                                }}
                                className="neo-modal-close"
                                title="Zamknij"
                            >
                                X
                            </button>
                        </div>

                        <div className="neo-modal-content">
                            {itemModalConfig.type === "add-item" && (
                                <form onSubmit={handleAddItem} className="flex flex-col gap-4">
                                    <div className="flex flex-col">
                                        <label className="neo-label">Nazwa produktu</label>
                                        <input
                                            type="text"
                                            className="neo-input w-full"
                                            value={newItemName}
                                            onChange={(e) => setNewItemName(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="neo-label">Kwota</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="neo-input w-full"
                                            value={newItemAmount}
                                            onChange={(e) => setNewItemAmount(e.target.value)}
                                        />
                                    </div>

                                    <div className="neo-modal-actions">
                                        <button
                                            type="button"
                                            onClick={() => setItemModalConfig({ isOpen: false, type: null, itemId: null })}
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
                            )}

                            {itemModalConfig.type === "edit-item" && (
                                <form onSubmit={handleEditItem} className="flex flex-col gap-4">
                                    <div className="flex flex-col">
                                        <label className="neo-label">Nazwa produktu</label>
                                        <input
                                            type="text"
                                            className="neo-input w-full"
                                            value={editItemName}
                                            onChange={(e) => setEditItemName(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="neo-label">Kwota</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="neo-input w-full"
                                            value={editItemAmount}
                                            onChange={(e) => setEditItemAmount(e.target.value)}
                                        />
                                    </div>

                                    <div className="neo-modal-actions">
                                        <button
                                            type="button"
                                            onClick={() => setItemModalConfig({ isOpen: false, type: null, itemId: null })}
                                            className="neo-btn flex-1 bg-white hover:bg-slate-200"
                                        >
                                            Anuluj
                                        </button>
                                        <button
                                            type="submit"
                                            className="neo-btn flex-1 bg-green-400 hover:bg-green-500"
                                        >
                                            Zapisz
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}