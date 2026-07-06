import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL;

export default function ShoppingListDetails() {
    const [list, setList] = useState(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [newItemName, setNewItemName] = useState("");

    const [promotionsMap, setPromotionsMap] = useState({});
    const [isLoadingPromos, setLoadingPromos] = useState(false);

    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null });
    const [editListName, setEditListName] = useState("");

    const [showPromotions, setShowPromotions] = useState(false);

    const { id } = useParams();
    const navigate = useNavigate();

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

    const parsedId = parseInt(id, 10) || 0;
    const bgColor = stickyColors[parsedId % stickyColors.length];
    const rotation = stickyRotations[parsedId % stickyRotations.length];

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        if (!token) return null;
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

        fetch(`${API}/api/shopping-lists/${id}`, { headers })
            .then((res) => {
                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    throw new Error('Wygasła sesja');
                }
                return res.json();
            })
            .then((data) => {
                setList(data);
                setIsLoading(false);
            })
            .catch(() => {
                setError("Nie udało się pobrać listy zakupów");
                setIsLoading(false);
            });
    }, [id, navigate]);

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItemName.trim()) return;

        const headers = getAuthHeaders();
        if (!headers) {
            navigate("/login");
            return;
        }
        try {
            const res = await fetch(`${API}/api/shopping-lists/${id}/items`, {
                method: "POST",
                headers: headers,
                body: JSON.stringify({
                    name: newItemName
                })
            });

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
                throw new Error('Wygasła sesja');
            }
            if (!res.ok) {
                throw new Error("Nie udało się dodać produktu do listy");
            }

            const newItem = await res.json();
            setList(prevList => ({
                ...prevList,
                shoppingListItems: [...prevList?.shoppingListItems || [], newItem]
            }));

            setNewItemName("");
        } catch (error) {
            console.log(error);
            setError("Błąd podczas dodawania produktu do listy zakupów");

        }
    };

    const handleEditList = async (e) => {
        e.preventDefault();
        if (!editListName.trim()) return;

        const headers = getAuthHeaders();
        if (!headers) {
            navigate("/login");
            return;
        }
        try {
            const res = await fetch(`${API}/api/shopping-lists/${id}`, {
                method: "PATCH",
                headers: headers,
                body: JSON.stringify({
                    name: editListName
                })
            });

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
                throw new Error('Wygasła sesja');
            }
            if (!res.ok) {
                throw new Error("Nie udało się zmienić nazwy listy");
            }


            setModalConfig({ isOpen: false, type: null });
            setList(prev => ({ ...prev, name: editListName }));
            setEditListName("");

        } catch (error) {
            console.log(error);
            setError("Błąd podczas dodawania produktu do listy zakupów");

        }
    };

    const handleDeleteList = async (e) => {
        e.preventDefault();

        const headers = getAuthHeaders();
        if (!headers) {
            navigate("/login");
            return;
        }
        try {
            const res = await fetch(`${API}/api/shopping-lists/${id}`, {
                method: "DELETE",
                headers: headers
            });

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
                throw new Error('Wygasła sesja');
            }
            if (!res.ok) {
                throw new Error("Nie udało się usunąć listy");
            }

            setModalConfig({ isOpen: false, type: null });
            navigate('/shopping-lists');

        } catch (error) {
            console.log(error);
            setError("Błąd podczas usuwania listy zakupów");
        }
    };

    const handleDeleteItem = async (itemId) => {

        const headers = getAuthHeaders();
        if (!headers) {
            navigate("/login");
            return;
        }
        try {
            const res = await fetch(`${API}/api/shopping-lists/${id}/items/${itemId}`, {
                method: "DELETE",
                headers: headers
            });

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
                throw new Error('Wygasła sesja');
            }
            if (!res.ok) {
                throw new Error("Nie udało się usunąć produktu");
            }

            const { deletedId } = await res.json();

            setList(prevList => ({
                ...prevList,
                shoppingListItems: prevList.shoppingListItems.filter(item => item.id !== deletedId)
            }));

        } catch (error) {
            console.log(error);
            setError("Błąd podczas usuwania produktu");
        }
    };

    useEffect(() => {
        if (!showPromotions || isLoading || !list?.shoppingListItems?.length) return;

        const missingItems = list.shoppingListItems.filter(item => !(item.id in promotionsMap));

        if (missingItems.length === 0) return;

        const fetchMissingPromotions = async () => {
            setError("");
            setLoadingPromos(true);
            const headers = getAuthHeaders();
            if (!headers) {
                navigate("/login");
                return;
            }
            const newlyFetchedPromos = {};

            try {
                await Promise.all(
                    missingItems.map(async (item) => {
                        try {
                            const res = await fetch(`${API}/api/promotions/search?q=${encodeURIComponent(item.name)}`, { headers })
                            if (res.status === 401 || res.status === 403) {
                                localStorage.removeItem('token');
                                navigate('/login');
                                throw new Error('Wygasła sesja');
                            }
                            if (res.ok) {
                                const data = await res.json();
                                newlyFetchedPromos[item.id] = data.slice(0, 3);
                            } else {
                                newlyFetchedPromos[item.id] = [];
                            }
                        } catch (err) {
                            if (err.message === 'Wygasła sesja') {
                                throw err;
                            }
                            newlyFetchedPromos[item.id] = [];
                        }
                    })
                );
                setPromotionsMap(prevMap => ({
                    ...prevMap,
                    ...newlyFetchedPromos
                }));
            } catch (error) {
                console.log(error);
                setError("Błąd podczas grupowego pobierania promocji.");
            } finally {
                setLoadingPromos(false);
            }
        };

        fetchMissingPromotions();

    }, [showPromotions, list?.shoppingListItems, navigate, isLoading, promotionsMap]);

    const handleToggleBought = async (itemId, currentIsBought) => {
        const headers = getAuthHeaders();
        if (!headers) {
            navigate('/login');
            return;
        }
        const newStatus = !currentIsBought;
        try {
            const res = await fetch(`${API}/api/shopping-lists/${id}/items/${itemId}`, {
                method: "PATCH",
                headers: headers,
                body: JSON.stringify({ isBought: newStatus })

            });

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
                throw new Error('Wygasła sesja');
            }
            if (!res.ok) {
                throw new Error("Nie udało się zaktualizować statusu produktu");
            }

            setList(prevList => ({
                ...prevList,
                shoppingListItems: prevList.shoppingListItems.map(item => item.id === itemId ? { ...item, isBought: newStatus } : item)
            }));
        } catch (err) {
            console.log(err);
            setError("Błąd podczas oznaczania produktu.");
        }
    };

    const handleLinkPromotion = async (itemId, promoId) => {
        const headers = getAuthHeaders();
        if (!headers) {
            navigate('/login');
            return;
        }
        try {
            const res = await fetch(`${API}/api/shopping-lists/${id}/items/${itemId}`, {
                method: 'PATCH',
                headers: headers,
                body: JSON.stringify({ promotionId: promoId })
            });

            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
                throw new Error('Wygasła sesja');
            }
            if (!res.ok) {
                throw new Error("Nie udało się zaktualizować promocji.");
            }

            setList(prevList => ({
                ...prevList,
                shoppingListItems: prevList.shoppingListItems.map(item => item.id === itemId ? { ...item, promotionId: promoId } : item)
            }));
        } catch (err) {
            console.log(err);
            setError("Błąd podczas przypisywania promocji.")
        }
    };

    const totalItems = list?.shoppingListItems?.length || 0;
    const boughtItems = list?.shoppingListItems.filter(i => i.isBought).length
    const progressPercent = totalItems === 0 ? 0 : Math.round((boughtItems / totalItems) * 100);

    return (
        <div className="neo-page-shell">
            <div className="w-full max-w-4xl flex flex-col gap-6">
                <div className="relative py-1">
                    <h1
                        onClick={() => navigate('/home')}
                        className="neo-brand-title cursor-pointer">
                        Expense Tracker
                    </h1>
                </div>

                {error && (
                    <div className="neo-alert">
                        <span className="text-xl">BŁĄD: {error}</span>
                        <button onClick={() => setError("")} className="hover:scale-110">×</button>
                    </div>
                )}


                <section className="neo-section relative flex flex-col gap-6 w-full">

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                        <div className="relative w-fit max-w-full mx-auto lg:mx-0 text-center">
                            <h2 className={`relative break-all z-10 inline-block w-fit max-w-full text-3xl 
                                sm:text-4xl font-black uppercase tracking-tighter border-4 border-black px-4 py-2 shadow-[4px_4px_0px_0px_#000] wrap-break-word transition-all ${bgColor} ${rotation}`}>
                                {isLoading ? "Ładowanie..." : list?.name}
                            </h2>
                        </div>

                        {/* Pasek postępu */}
                        {!isLoading && totalItems > 0 && (
                            <div className="flex flex-col gap-1 w-full lg:w-[30%] shrink-0">
                                <div className="flex justify-between text-sm font-black uppercase tracking-tight">
                                    <span>Postęp</span>
                                    <span>{progressPercent}%</span>
                                </div>
                                <div className="h-6 w-full bg-white border-4 border-black shadow-[2px_2px_0px_0px_#000] p-0.5">
                                    <div
                                        className="h-full bg-green-400 transition-all duration-500 ease-out"
                                        style={{ width: `${progressPercent}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                    </div>
                    <div className="h-1 w-full bg-black shrink-0"></div>

                    {/* Formularz dodawania */}
                    <form onSubmit={handleAddItem} className="flex flex-col md:flex-row w-full gap-4 ">
                        <input
                            type="text"
                            className="neo-input flex-1 py-4 text-xl"
                            placeholder="Wpisz co chcesz kupić..."
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            className="neo-btn flex items-center justify-center gap-1 rounded-xl text-xl uppercase px-8 py-3 hover:bg-yellow-300 hover:-translate-y-1 hover:-translate-x-1 shadow-[0px_0px_0px_0px_#000] hover:shadow-[4px_4px_0px_0px_#000] transition-all active:translate-y-0 active:translate-x-0 active:shadow-none"
                            disabled={isLoading}
                        >
                            <span className="text-3xl leading-none -mt-1.5">&#x0002B;</span>
                            <span>Dodaj</span>
                        </button>
                    </form>

                    {/* Lista produktów */}
                    <div className="flex flex-col items-center gap-3 w-full h-full">
                        {isLoading && (
                            <div className="text-center text-2xl font-black mt-10 animate-pulse">
                                Sprawdzam listę...
                            </div>
                        )}

                        {!isLoading && totalItems === 0 && (
                            <div className="neo-empty-state">
                                <span className="text-4xl mb-4">🛒</span>
                                <span className="text-xl font-bold uppercase text-center">Lista jest pusta.</span>
                            </div>
                        )}

                        {/* Pozycje na liście */}
                        {!isLoading && list?.shoppingListItems?.map((item, index) => {

                            const activePromotion = promotionsMap[item.id]?.find(p => p.id === item.promotionId);
                            return (

                                <div
                                    key={item.id}
                                    className={`w-[90%] shadow-[4px_4px_0px_0px_#000] group rounded-3xl flex items-center justify-center  border-4 border-black pr-5 pl-5 p-3 ${item.promotionId ? 'bg-yellow-200 hover:bg-yellow-300' : 'bg-slate-200 hover:bg-slate-300'}  transition-colors`}
                                >
                                    <div className="flex items-start gap-4  w-full">

                                        {/* Checkbox */}
                                        <button
                                            type="button"
                                            onClick={() => handleToggleBought(item.id, item.isBought)}
                                            className="neo-checkbox"

                                        >
                                            {item.isBought && <span className="text-2xl font-black text-black leading-none m-1">&#10003;</span>}
                                        </button>

                                        {/* Numer i nazwa */}
                                        <div className="flex items-baseline gap-3 my-0.5">
                                            <span className="text-slate-500 font-black text-sm">{index + 1}.</span>

                                            <span className={`font-bold text-xl uppercase tracking-tighter   ${item.isBought ? `line-through text-orange-500 ` : ''}`}>
                                                {activePromotion ? activePromotion.name : item.name}
                                            </span>

                                        </div>
                                    </div>

                                    {/* Przycisk usuwania */}
                                    <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="shrink-0 bg-red-400 border-4 border-black w-8 h-8 flex items-center justify-center font-black text-xl hover:bg-red-500 hover:shadow-[2px_2px_0px_0px_#000] transition-all"
                                        title="Usuń z listy"
                                    >
                                        ×
                                    </button>
                                </div>

                            )
                        })}
                    </div>

                    <div className='mt-5 flex w-full justify-between'>

                        {/* Checkbox czy wyświetlić promocje */}
                        <label className="flex flex-col md:flex-row items-center gap-4 cursor-pointer group ">
                            <div className="relative shrink-0">
                                <input
                                    type="checkbox"
                                    className="peer sr-only"
                                    checked={showPromotions}
                                    onChange={(e) => setShowPromotions(e.target.checked)}
                                />
                                <div className="neo-checkbox w-10 h-10">
                                    {showPromotions && <span className="text-3xl font-black block">X</span>}
                                </div>
                            </div>
                            <span className="text-center font-black uppercase text-base md:text-2xl tracking-tighter select-none">
                                Wyświetl promocje
                            </span>
                        </label>




                        {/* Akcje listy (Edycja / Usuwanie) */}
                        {!isLoading && list && (
                            <div className="flex flex-col md:flex-row sm:w-auto gap-4">
                                <button
                                    onClick={() => {
                                        setEditListName(list.name);
                                        setModalConfig({ isOpen: true, type: 'edit' })
                                    }}
                                    className="neo-btn rounded-xl text-md uppercase px-8 py-3 bg-green-400 hover:bg-green-500 text-black shadow-[4px_4px_0px_0px_#000] transition-all active:translate-y-1 active:translate-x-1 active:shadow-none"
                                >
                                    Zmień Nazwę
                                </button>
                                <button
                                    onClick={() => setModalConfig({ isOpen: true, type: 'delete' })}
                                    className="neo-btn rounded-xl text-md uppercase px-8 py-3 bg-red-400 hover:bg-red-500 text-black shadow-[4px_4px_0px_0px_#000] transition-all active:translate-y-1 active:translate-x-1 active:shadow-none"
                                >
                                    Usuń
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* Stan: Pusta lista, ale zaznaczono checkbox */}
                {showPromotions && totalItems === 0 && (
                    <div className="neo-section flex flex-col w-full items-center text-center">
                        <span className="text-5xl">🕵️‍♂️</span>
                        <h3 className="text-2xl font-black uppercase tracking-tight">Brak produktów na liście!</h3>
                        <p className="text-lg font-bold">Dodaj produkty do listy, żebyśmy mogli znaleźć promocje.</p>
                    </div>
                )}

                {/* Stan: Wyświetlanie promocji */}
                {
                    showPromotions && totalItems !== 0 && (
                        <section className='neo-section flex flex-col w-full'>
                            <label className="neo-label text-3xl uppercase text-center tracking-tight">Znalezione Promocje</label>
                            <div className="h-1 w-full bg-black shrink-0"></div>

                            {isLoadingPromos ? (
                                <div className="text-center text-3xl font-black mt-10 mb-10 animate-pulse">
                                    Szukanie najlepszych ofert... ⏳
                                </div>
                            ) : (!isLoading && list?.shoppingListItems?.map((item, index) => {

                                const itemPromos = promotionsMap[item.id];
                                if (!itemPromos && isLoadingPromos) return null;
                                return (

                                    <div key={item.id} className="flex flex-col gap-4 mt-10 w-full">

                                        <div className="flex items-center gap-4 w-full">
                                            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter bg-white text-black border-4 border-black px-4 py-1 shrink-0">
                                                {item.name}
                                            </h3>
                                            <div className="h-0 w-full border-t-4 border-dashed border-black/40"></div>
                                        </div>

                                        {itemPromos && itemPromos.length === 0 && (
                                            <div className="w-full text-center p-6 border-4 border-black bg-slate-100">
                                                <span className="font-bold text-lg uppercase tracking-tight">Brak promocji na ten produkt</span>
                                            </div>
                                        )}
                                        {itemPromos && itemPromos.length > 0 && (
                                            <div className='neo-card-grid grid-cols-2 md:grid-cols-3 gap-5'>
                                                {
                                                    promotionsMap[item.id]?.map(promo => {


                                                        const isSelected = item.promotionId === promo.id;
                                                        return (
                                                            <div id="promotion"
                                                                key={promo.id}
                                                                onClick={() => handleLinkPromotion(item.id, isSelected ? null : promo.id)}
                                                                className={`group relative flex flex-col h-full border-4 border-black rounded-xl p-1 cursor-pointer transition-all duration-200
                                                            ${isSelected
                                                                        ? 'bg-yellow-200 translate-y-1 translate-x-1 shadow-none border-dashed'
                                                                        : 'bg-white shadow-[4px_4px_0px_0px_#000]'
                                                                    } `}>
                                                                <div className="w-full h-28 bg-white  flex items-center justify-center shrink-0">
                                                                    <img src={promo.imagePath} alt={promo.categoryName} className="w-full h-full object-contain" />
                                                                </div>

                                                                <div>
                                                                    <div className="h-0.5 w-full bg-black shrink-0"></div>


                                                                    <div className="flex flex-col items-center text-center">
                                                                        <div className="p-1">
                                                                            <span className="font-bold text-base uppercase tracking-tight ">{promo.name}</span>
                                                                        </div>
                                                                        <div className="h-0.5 w-1/2 bg-black shrink-0"></div>


                                                                        <div className="p-1">
                                                                            <span className="font-bold text-base tracking-tight ">{promo.promoDetails}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>



                                                                <div className="mt-auto -m-1 bg-yellow-400 group-hover:bg-yellow-300 border-t-4 border-black p-2 pt-3 rounded-b-lg flex flex-col gap-1">


                                                                    <div className="flex flex-wrap justify-between items-start gap-1 w-full ">
                                                                        <span className="text-[12px] line-through text-black/60 font-bold leading-tight max-w-[60%]">
                                                                            {promo.oldPrice !== "-" ? `${promo.oldPrice}` : ""}
                                                                        </span>


                                                                        {promo.depositPrice && promo.depositPrice !== "-" && (
                                                                            <span className="text-[11px] font-black bg-black text-white px-1.5 py-0.5 uppercase tracking-tighter whitespace-nowrap">
                                                                                {promo.depositPrice}
                                                                            </span>
                                                                        )}
                                                                    </div>


                                                                    <div className="flex flex-wrap items-end justify-between gap-x-2 gap-y-1 w-full mt-1">
                                                                        <div className="flex items-baseline gap-0.5 shrink-0">
                                                                            <span className="font-black text-3xl leading-none tracking-tighter">
                                                                                {promo.promoPrice.toString().replace('.', ',')}
                                                                            </span>
                                                                            <span className="font-black text-sm uppercase">zł</span>
                                                                        </div>

                                                                        <span className="text-[12px] font-black text-black uppercase pb-0.5 text-right leading-tight max-w-[55%] wrap-break-word">
                                                                            {promo.priceUnit}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        )}
                                    </div>
                                )
                            })
                            )}

                        </section>
                    )
                }


            </div >
            {/* Przycisk powrotu */}
            <div className="flex justify-center w-full mt-8">
                <button type="button"
                    onClick={() => navigate("/shopping-lists")}
                    className="bg-yellow-100 w-full max-w-xs neo-btn py-3 px-8 text-xl hover:bg-yellow-200">
                    &#10094; Powrót
                </button>
            </div>
            {/* Okna modalne */}
            {modalConfig.isOpen && (
                <div className="neo-modal-overlay">
                    <div className="neo-modal-container">

                        <div className="neo-modal-header">
                            <h2 className="neo-modal-title">
                                {modalConfig.type === 'edit' ? 'Zmień nazwę' : 'Usuń listę'}
                            </h2>
                            <button
                                onClick={() => {
                                    setModalConfig({ isOpen: false, type: null });
                                    setEditListName("");
                                }}
                                className="neo-modal-close"
                                title="Zamknij"
                            >
                                X
                            </button>
                        </div>

                        <div className="neo-modal-content">
                            {/* Okno modalne: dodawanie */}
                            {modalConfig.type === 'edit' && (
                                <form onSubmit={handleEditList} className="flex flex-col gap-4">
                                    <input
                                        type="text"
                                        autoFocus
                                        className="neo-input py-4 text-xl w-full"
                                        placeholder="Wpisz nową nazwę..."
                                        value={editListName}
                                        onChange={e => setEditListName(e.target.value)}
                                    />
                                    <div className="neo-modal-actions">
                                        <button type="button" onClick={() => setModalConfig({ isOpen: false, type: null })} className="neo-btn flex-1 bg-white hover:bg-slate-200">
                                            Anuluj
                                        </button>
                                        <button type="submit" className="neo-btn flex-1 bg-green-400 hover:bg-green-500" disabled={!editListName.trim()}>
                                            Zapisz
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Okno modalne: usuwanie */}
                            {modalConfig.type === 'delete' && (
                                <div className="flex flex-col gap-4">
                                    <div className="bg-slate-100 border-4 border-dashed border-black p-6 text-xl font-bold uppercase tracking-tight text-center">
                                        Czy na pewno usunąć listę <br />
                                        <span className="inline-block max-w-full break-all bg-yellow-200 border-2 border-black px-2 py-1 mt-3">"{list?.name}"</span> ? <br />
                                        <span className="block mt-4 text-sm text-black/60">Tej akcji nie da się cofnąć!</span>
                                    </div>

                                    <div className="neo-modal-actions">
                                        <button type="button" onClick={() => setModalConfig({ isOpen: false, type: null })} className="neo-btn flex-1 bg-white hover:bg-slate-200">
                                            Anuluj
                                        </button>
                                        <button onClick={handleDeleteList} className="neo-btn flex-1 bg-red-500 hover:bg-red-600 text-black">
                                            TAK, USUŃ!
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            )}
        </div >
    );
}