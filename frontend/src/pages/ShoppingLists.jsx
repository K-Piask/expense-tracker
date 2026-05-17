import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = "http://localhost:3000";

export default function ShoppingLists() {
    const [shoppingLists, setShoppingLists] = useState([]);
    const [error, setError] = useState("");

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
            })
            .catch(() => setError("Nie udało się pobrać list zakupów"));
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
        <div>
            <div className="flex flex-col items-center justify-start min-h-screen w-full bg-linear-to-br from-slate-500 via-slate-700 to-slate-900 p-4 md:p-10">
                <div className="w-full max-w-6xl flex flex-col gap-6">
                    <div className="relative py-1">
                        <h1 className=" relative z-10 mx-auto table text-center text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic leading-none pt-2 pb-4 px-10 mb-4 
        before:content-[''] before:absolute before:inset-0 before:-z-10 before:bg-slate-950 before:-skew-x-11 before:rounded-2xl shadow-2xl">
                            Expense Tracker</h1>
                    </div>
                    {error && (
                        <div className="bg-red-400 border-4 border-black p-4 rounded-2xl font-black text-black shadow-[4px_4px_0px_0px_#000] flex justify-between">
                            <span>BŁĄD: {error}</span>
                            <button onClick={() => setError("")} className="hover:scale-110">×</button>
                        </div>
                    )}

                    <section className="neo-section flex flex-col gap-5 h-[70vh] w-full items-center">
                        <label className="neo-label text-3xl text-center tracking-tight">Listy Zakupów</label>
                        <div className="h-1 w-full bg-black shrink-0"></div>

                        <div className="flex flex-col w-full h-full p-5 border-4 border-black rounded-xl bg-gray-200 min-h-0">
                            <div className="items-center grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 content-start gap-7 w-full h-full overflow-y-auto p-3 pr-2 pb-2 custom-scrollbar">
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
                                                    <span className="text-sm bg-white px-2 py-1 border-2 border-black ">
                                                        Elementy: {list.shoppingListItems ? list.shoppingListItems.length : 0}
                                                    </span>
                                                    <span className="text-2xl">&#10140;</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                                <div className="flex items-center justify-center min-h-50">
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        aria-label="Zamknij"
                                        className="relative w-24 h-24 group cursor-pointer focus:outline-none drop-shadow-[4px_4px_0_#000] active:drop-shadow-none active:translate-x-1 active:translate-y-1 transition-all"
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
                        </div>

                    </section>
                    <div className="flex justify-center gap-4">

                        <button type="button" onClick={() => navigate("/home")} className="bg-yellow-100 neo-btn py-2 hover:bg-yellow-200 w-1/2">&#128281; Powrót na Stronę Główną</button>
                    </div>




                </div>

            </div>
            {/*OKNO MODALNE (Dodawanie)*/}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">

                    <div className="bg-white border-4 border-black w-full max-w-md p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col gap-6 relative">

                        <div className="flex justify-between items-center border-b-4 border-black pb-4">
                            <h2 className="font-black text-2xl uppercase tracking-tighter">Utwórz nową listę</h2>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setNewListName("");
                                }}
                                className="shrink-0 bg-red-400 border-4 border-black w-8 h-8 flex items-center justify-center font-black text-xl hover:bg-red-500 hover:shadow-[2px_2px_0px_0px_#000] transition-all"
                            >
                                X
                            </button>
                        </div>

                        <form
                            onSubmit={handleAddList}
                            className="flex flex-col gap-4"
                        >
                            <div className="flex flex-col gap-2">
                                <label className="font-bold uppercase text-sm">Nazwa listy</label>
                                <input
                                    type="text"
                                    autoFocus
                                    className="neo-input flex-1 px-4 py-3 text-lg w-full"
                                    placeholder="np. Zakupy domowe..."
                                    value={newListName}
                                    onChange={(e) => setNewListName(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                className="neo-btn w-full mt-2 rounded-xl text-xl uppercase px-8 py-3 hover:bg-yellow-300 transition-all"
                                disabled={!newListName.trim()}
                            >
                                &#x0002B; Utwórz
                            </button>
                        </form>

                    </div>
                </div>
            )}
        </div>
    )
}