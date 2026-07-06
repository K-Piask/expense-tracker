import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL;

export default function ShoppingLists() {
    const [shoppingLists, setShoppingLists] = useState([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newListName, setNewListName] = useState("");

    const navigate = useNavigate();

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            return null;
        }
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

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
                    localStorage.removeItem('token');
                    navigate('/login');
                    throw new Error('Wygasła sesja');
                }
                return res.json();
            })
            .then((data) => {
                if (Array.isArray(data)) {
                    setShoppingLists(data);
                } else {
                    setShoppingLists([]);
                }
                setIsLoading(false);
            })
            .catch(() => {
                setError("Nie udało się pobrać list zakupów");
                setIsLoading(false);
            });
    }, [navigate]);

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
    let bgColor, rotation;


    const handleAddList = async (e) => {
        e.preventDefault();
        if (!newListName.trim()) return;

        const headers = getAuthHeaders();
        if (!headers) {
            navigate("/login");
            return;
        }
        try {
            const res = await fetch(`${API}/api/shopping-lists`, {
                method: "POST",
                headers: headers,
                body: JSON.stringify({
                    name: newListName
                })
            });

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
                throw new Error('Wygasła sesja');
            }
            if (!res.ok) {
                throw new Error("Nie udało się utworzyć listy zakupów");
            }
            const newList = await res.json();
            navigate(`/shopping-list-details/${newList.id}`)
        } catch (error) {
            console.log(error);
            setError("Błąd podczas tworzenia nowej listy zakupów.")
        }
    }
    return (

        <div className="neo-page-shell">
            <div className="w-full max-w-6xl flex flex-col gap-6">

                <div className="relative py-1">
                    <h1 onClick={() => navigate('/home')} className="neo-brand-title cursor-pointer">
                        Expense Tracker
                    </h1>
                </div>

                {error && (
                    <div className="neo-alert">
                        <span>BŁĄD: {error}</span>
                        <button onClick={() => setError("")} className="hover:scale-110">×</button>
                    </div>
                )}

                <section className="neo-section items-center">
                    <label className="neo-label text-3xl text-center tracking-tight">Listy Zakupów</label>
                    <div className="h-1 w-full bg-black shrink-0"></div>
                    <div className="flex flex-col w-full h-full p-5">
                        {isLoading && <div className="text-center text-3xl font-black mt-10 mb-10 animate-pulse">Ładowanie list...</div>}
                        {!isLoading && shoppingLists.length === 0 && (
                            <div className="neo-empty-state">
                                <span className="text-4xl mb-4">📌</span>
                                <span className="text-xl font-bold uppercase text-center">Brak list zakupów.</span>
                                <span className="text-sm font-black uppercase tracking-widest text-slate-500 mt-2">Dodaj nową listę poniżej</span>
                                <div className="flex items-center justify-center mt-4">
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        aria-label="Dodaj listę"
                                        className="neo-fab-plus group"
                                    >
                                        {/* Pozioma belka (Szersza i wyższa o 8px) */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[calc(15%+8px)] bg-black rounded-full"></div>

                                        {/* Pionowa belka (Wyższa i szersza o 8px) */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-[calc(15%+8px)] bg-black rounded-full"></div>

                                        {/* Pozioma belka (Krótsza o 8px i standardowa grubość 15%) */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-8px)] h-[15%] bg-yellow-400 group-hover:bg-yellow-300 rounded-full transition-colors"></div>

                                        {/* Pionowa belka (Krótsza o 8px i standardowa grubość 15%) */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[calc(100%-8px)] w-[15%] bg-yellow-400 group-hover:bg-yellow-300 rounded-full transition-colors"></div>
                                    </button>

                                </div>

                            </div>
                        )}

                        {!isLoading && shoppingLists.length > 0 && (
                            <div className="neo-card-grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 content-start p-3 pr-2 pb-2">



                                {
                                    shoppingLists.map(list => {

                                        bgColor = stickyColors[list.id % stickyColors.length];
                                        rotation = stickyRotations[list.id % stickyRotations.length];

                                        return (
                                            <div id="shoppingList"
                                                key={list.id} onClick={() => navigate(`/shopping-list-details/${list.id}`)}
                                                className={`relative flex flex-col justify-between p-5 min-h-50 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${bgColor} ${rotation}`}>


                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full border-[3px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-10 flex items-center justify-center">

                                                    <div className="w-1.5 h-1.5 bg-white rounded-full opacity-70 -translate-x-0.5 -translate-y-0.5"></div>
                                                </div>

                                                <div>
                                                    <h2 className="text-2xl font-black uppercase tracking-tighter leading-none mb-2 wrap-break-word">
                                                        {list.name}
                                                    </h2>
                                                    <div className="h-1 w-1/3 bg-black mb-4"></div>
                                                </div>

                                                <div className="flex justify-between items-end mt-auto font-bold">
                                                    <span className="text-md bg-white px-2 py-1 border-2 border-black ">
                                                        {list.shoppingListItems.length > 0 ? "Elementy: " + list.shoppingListItems.length : "Brak elementów"}
                                                    </span>
                                                    <span className="text-2xl">&#10140;</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                                <div className="flex items-center justify-center">
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        aria-label="Dodaj listę"
                                        className="neo-fab-plus group"
                                    >
                                        {/* Pozioma belka (Szersza i wyższa o 8px) */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[calc(15%+8px)] bg-black rounded-full"></div>

                                        {/* Pionowa belka (Wyższa i szersza o 8px) */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-[calc(15%+8px)] bg-black rounded-full"></div>

                                        {/* Pozioma belka (Krótsza o 8px i standardowa grubość 15%) */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-8px)] h-[15%] bg-yellow-400 group-hover:bg-yellow-300 rounded-full transition-colors"></div>

                                        {/* Pionowa belka (Krótsza o 8px i standardowa grubość 15%) */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[calc(100%-8px)] w-[15%] bg-yellow-400 group-hover:bg-yellow-300 rounded-full transition-colors"></div>
                                    </button>
                                </div>
                            </div>)}
                    </div>

                </section>





            </div>
            {/* Przycisk powrotu */}
            <div className="flex justify-center w-full mt-8">
                <button type="button"
                    onClick={() => navigate("/home")}
                    className="bg-yellow-100 w-full max-w-xs neo-btn py-3 px-8 text-xl hover:bg-yellow-200">
                    &#10094; Powrót
                </button>
            </div>

            {/* Okno modalne: dodawanie */}
            {
                isModalOpen && (
                    <div className="neo-modal-overlay">
                        <div className="neo-modal-container">

                            <div className="neo-modal-header">
                                <h2 className="neo-modal-title">Utwórz nową listę</h2>
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setNewListName("");
                                    }}
                                    className="neo-modal-close"
                                    title="Zamknij"
                                >
                                    X
                                </button>
                            </div>

                            <div className="neo-modal-content">
                                <form onSubmit={handleAddList} className="flex flex-col gap-4">
                                    <input
                                        type="text"
                                        autoFocus
                                        className="neo-input py-4 text-xl w-full"
                                        placeholder="np. Zakupy domowe..."
                                        value={newListName}
                                        onChange={(e) => setNewListName(e.target.value)}
                                    />
                                    <div className="neo-modal-actions">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="neo-btn flex-1 bg-white hover:bg-slate-200"
                                        >
                                            Anuluj
                                        </button>
                                        <button
                                            type="submit"
                                            className="neo-btn flex-1 bg-yellow-400 hover:bg-yellow-500"
                                            disabled={!newListName.trim()}
                                        >
                                            Utwórz
                                        </button>
                                    </div>
                                </form>
                            </div>

                        </div>
                    </div>
                )
            }
        </div >
    )
}