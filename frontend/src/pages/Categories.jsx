import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL;

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, categoryId: null });

    const [newCategoryName, setNewCategoryName] = useState("");
    const [editCategoryName, setEditCategoryName] = useState("");

    const navigate = useNavigate();

    const tagColors = [
        "bg-cyan-400",
        "bg-pink-400",
        "bg-lime-400",
        "bg-blue-400",
        "bg-purple-400",
        "bg-orange-400"
    ];

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    // Pobieranie kategorii
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
                    localStorage.removeItem('token');
                    navigate('/login');
                    throw new Error('Wygasła sesja');
                }
                return res.json();
            })
            .then((data) => {
                if (Array.isArray(data)) {
                    setCategories(data);
                } else {
                    setCategories([]);
                }
                setIsLoading(false);
            })
            .catch(() => {
                setError("Nie udało się pobrać kategorii");
                setIsLoading(false);
            });
    }, [navigate]);

    // Dodawanie kategorii
    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        const headers = getAuthHeaders();
        if (!headers) return navigate("/login");

        try {
            const res = await fetch(`${API}/api/categories`, {
                method: "POST",
                headers: headers,
                body: JSON.stringify({ name: newCategoryName })
            });

            if (res.status === 401 || res.status === 403) throw new Error('Wygasła sesja');
            if (!res.ok) throw new Error("Nie udało się utworzyć kategorii");

            const newCat = await res.json();
            setCategories(prev => [...prev, newCat]);

            // Czyszczenie i zamknięcie modala
            setNewCategoryName("");
            setModalConfig({ isOpen: false, type: null, categoryId: null });

        } catch (error) {
            if (error.message === 'Wygasła sesja') {
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                setError("Błąd podczas tworzenia kategorii.");
            }
        }
    }

    // Edycja kategorii
    const handleEditCategory = async (e) => {
        e.preventDefault();
        if (!editCategoryName.trim()) return;

        const headers = getAuthHeaders();
        if (!headers) return navigate("/login");

        try {
            const res = await fetch(`${API}/api/categories/${modalConfig.categoryId}`, {
                method: "PUT",
                headers: headers,
                body: JSON.stringify({ name: editCategoryName })
            });

            if (res.status === 401 || res.status === 403) throw new Error('Wygasła sesja');
            if (!res.ok) throw new Error("Nie udało się zmienić nazwy kategorii");

            const updatedCat = await res.json();
            setCategories(prev => prev.map(cat => cat.id === modalConfig.categoryId ? { ...cat, name: updatedCat.name } : cat));

            setModalConfig({ isOpen: false, type: null, categoryId: null });
            setEditCategoryName("");

        } catch (error) {
            if (error.message === 'Wygasła sesja') {
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                setError("Błąd podczas edycji kategorii.");
            }
        }
    };

    // Usuwanie kategorii
    const handleDeleteCategory = async () => {
        const headers = getAuthHeaders();
        if (!headers) return navigate("/login");

        try {
            const res = await fetch(`${API}/api/categories/${modalConfig.categoryId}`, {
                method: "DELETE",
                headers: headers
            });

            if (res.status === 401 || res.status === 403) throw new Error('Wygasła sesja');
            if (!res.ok) throw new Error("Nie udało się usunąć kategorii");

            setCategories(prev => prev.filter(cat => cat.id !== modalConfig.categoryId));
            setModalConfig({ isOpen: false, type: null, categoryId: null });

        } catch (error) {
            if (error.message === 'Wygasła sesja') {
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                setError("Błąd podczas usuwania kategorii.");
            }
        }
    };

    // Pomocnik: aktywna kategoria
    const getActiveCategoryName = () => {
        const cat = categories.find(c => c.id === modalConfig.categoryId);
        return cat ? cat.name : "";
    };

    return (
        <div className="neo-page-shell">
            <div className="w-full max-w-4xl flex flex-col gap-6">

                <div className="relative py-1">
                    <h1 onClick={() => navigate('/home')} className="neo-brand-title cursor-pointer">
                        Expense Tracker
                    </h1>
                </div>

                {error && (
                    <div className="neo-alert">
                        <span className="text-xl">BŁĄD: {error}</span>
                        <button onClick={() => setError("")} className="hover:scale-110 text-3xl font-black leading-none pb-1">×</button>
                    </div>
                )}

                <section className="neo-section relative flex flex-col ">

                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <label className="neo-label text-3xl tracking-tight">Kategorie</label>
                        {/* Przycisk dodawania */}
                        <button
                            onClick={() => setModalConfig({ isOpen: true, type: 'add', categoryId: null })}
                            className="neo-btn flex items-center gap-2 hover:bg-yellow-300 px-8 py-3 text-xl uppercase"
                        >
                            <span className="text-3xl leading-none -mt-1">+</span> Dodaj
                        </button>
                    </div>

                    <div className="h-1 w-full bg-black shrink-0"></div>

                    {isLoading && (
                        <div className="text-center text-3xl font-black mt-10 mb-10 animate-pulse">
                            Szukanie kategorii...
                        </div>
                    )}

                    {!isLoading && categories.length === 0 && (
                        <div className="neo-empty-state">
                            <span className="text-4xl mb-4">🏷️</span>
                            <span className="text-xl font-bold uppercase text-center">Brak dodanych kategorii.</span>
                        </div>
                    )}

                    {/* Lista kategorii */}
                    {!isLoading && categories.length > 0 && (
                        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-5 md:mt-4 p-4">
                            {categories.map((cat) => {
                                const bgColor = tagColors[cat.id % tagColors.length];

                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setModalConfig({ isOpen: true, type: 'menu', categoryId: cat.id })}
                                        className={`relative flex items-center gap-3 border-4 border-black rounded-full px-5 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:translate-x-0 active:shadow-none transition-all duration-200 cursor-pointer ${bgColor}`}
                                    >
                                        <div className="w-5 h-5 rounded-full border-[3px] border-black bg-white/70 shrink-0"></div>

                                        <span className="font-black break-all text-sm md:text-xl uppercase tracking-tighter pt-0.5">
                                            {cat.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                </section>

                {/* Przycisk powrotu */}
                <div className="flex justify-center w-full mt-2">
                    <button type="button" onClick={() => navigate("/home")} className="bg-yellow-100 w-full max-w-xs neo-btn py-3 px-8 text-xl hover:bg-yellow-200">
                        &#10094; Powrót
                    </button>
                </div>

                {/* Okna modalne */}
                {modalConfig.isOpen && (
                    <div className="neo-modal-overlay">
                        <div className="neo-modal-container">


                            <div className="neo-modal-header">
                                <h2 className="neo-modal-title">
                                    {modalConfig.type === 'add' && 'Dodaj Kategorię'}
                                    {modalConfig.type === 'menu' && 'Menu Akcji'}
                                    {modalConfig.type === 'edit' && 'Zmień nazwę'}
                                    {modalConfig.type === 'delete' && 'Usuń Kategorię'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setModalConfig({ isOpen: false, type: null, categoryId: null });
                                        setNewCategoryName("");
                                        setEditCategoryName("");
                                    }}
                                    className="neo-modal-close"
                                >
                                    X
                                </button>
                            </div>

                            <div className="neo-modal-content">
                                {/* Okno modalne: dodawanie */}
                                {modalConfig.type === 'add' && (
                                    <form onSubmit={handleAddCategory} className="flex flex-col gap-4">
                                        <input
                                            type="text"
                                            autoFocus
                                            className="neo-input py-4 text-xl w-full"
                                            placeholder="Nazwa kategorii..."
                                            value={newCategoryName}
                                            onChange={e => setNewCategoryName(e.target.value)}
                                        />
                                        <div className="neo-modal-actions">
                                            <button type="button" onClick={() => setModalConfig({ isOpen: false, type: null, categoryId: null })} className="neo-btn flex-1 bg-white hover:bg-slate-200">
                                                Anuluj
                                            </button>
                                            <button
                                                type="submit"
                                                className="neo-btn flex-1 bg-yellow-400 hover:bg-yellow-500"
                                                disabled={!newCategoryName.trim()}
                                            >
                                                Zapisz
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* Okno modalne: menu akcji */}
                                {modalConfig.type === 'menu' && (
                                    <>
                                        <div className="text-center bg-slate-100 border-4 border-dashed border-black p-4 mb-2">
                                            <span className="block text-sm font-bold text-slate-500 uppercase mb-1">Wybrano kategorię:</span>
                                            <h2 className="font-black text-3xl uppercase tracking-tighter text-blue-600 wrap-break-word">
                                                {getActiveCategoryName()}
                                            </h2>
                                        </div>
                                        <div className="flex flex-col gap-4">
                                            <button
                                                onClick={() => {
                                                    setEditCategoryName(getActiveCategoryName());
                                                    setModalConfig(prev => ({ ...prev, type: 'edit' }));
                                                }}
                                                className="neo-btn py-4 text-xl bg-green-400 hover:bg-green-500"
                                            >
                                                ✎ Zmień nazwę
                                            </button>
                                            <button
                                                onClick={() => setModalConfig(prev => ({ ...prev, type: 'delete' }))}

                                                className="neo-btn py-4 text-xl bg-red-400 hover:bg-red-500 text-black"
                                            >
                                                × Usuń kategorię
                                            </button>
                                        </div>
                                    </>
                                )}

                                {/* Okno modalne: edycja */}
                                {modalConfig.type === 'edit' && (
                                    <form onSubmit={handleEditCategory} className="flex flex-col gap-4">
                                        <input
                                            type="text"
                                            autoFocus
                                            className="neo-input py-4 text-xl w-full"
                                            value={editCategoryName}
                                            onChange={e => setEditCategoryName(e.target.value)}
                                        />
                                        <div className="neo-modal-actions">
                                            <button type="button" onClick={() => setModalConfig(prev => ({ ...prev, type: 'menu' }))} className="neo-btn flex-1 bg-white hover:bg-slate-200">
                                                Wróć
                                            </button>
                                            <button
                                                type="submit"
                                                className="neo-btn flex-1 bg-green-400 hover:bg-green-500"
                                                disabled={!editCategoryName.trim()}
                                            >
                                                Zapisz
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* Okno modalne: usuwanie */}
                                {modalConfig.type === 'delete' && (
                                    <div className="flex flex-col gap-4">
                                        <div className="bg-slate-100 border-4 border-dashed border-black p-6 text-xl font-bold uppercase tracking-tight text-center">
                                            Czy na pewno usunąć kategorię <br />
                                            <span className="inline-block max-w-full break-all bg-yellow-200 border-2 border-black px-2 py-1 mt-3">"{getActiveCategoryName()}"</span> ? <br />
                                            <span className="block mt-4 text-sm text-black/60">Tej akcji nie da się cofnąć!</span>
                                        </div>
                                        <div className="neo-modal-actions">
                                            <button type="button" onClick={() => setModalConfig(prev => ({ ...prev, type: 'menu' }))} className="neo-btn flex-1 bg-white hover:bg-slate-200">
                                                Anuluj
                                            </button>
                                            <button onClick={handleDeleteCategory} className="neo-btn flex-1 bg-red-500 hover:bg-red-600 text-black">
                                                TAK, USUŃ!
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}