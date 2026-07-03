import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;
export default function Promotions() {
    const [searchedProduct, setSearchedProduct] = useState("");
    const [promotions, setPromotions] = useState([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);


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

    const handlePromotions = async (e) => {
        if (e) e.preventDefault();
        if (!searchedProduct.trim()) return;
        setError("");

        const headers = getAuthHeaders();
        if (!headers) {
            navigate("/login");
            return;
        }

        setIsLoading(true);
        setPromotions([]);
        const url = `${API}/api/promotions/search?q=${searchedProduct}`;
        try {
            const res = await fetch(url, {
                method: "GET",
                headers: headers
            });
            if (!res.ok) {
                throw new Error("Wystąpił błąd podczas wyszukiwania promocji");
            }
            const data = await res.json();

            setPromotions(data);
            setHasSearched(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <div className="neo-page-shell">
            <div className="w-full max-w-6xl flex flex-col gap-6">
                <div className="relative py-1">
                    <h1
                        onClick={() => navigate('/home')}
                        className="neo-brand-title cursor-pointer">
                        Expense Tracker
                    </h1>
                </div>
                {error && (
                    <div className="neo-alert">
                        <span>BŁĄD: {error}</span>
                        <button onClick={() => setError("")} className="hover:scale-110">×</button>
                    </div>
                )}

                <section className="neo-section">
                    <label className="neo-label text-3xl text-center tracking-tight">Wyszukiwarka Promocji</label>
                    <div className="h-1 w-full bg-black shrink-0"></div>
                    <form onSubmit={handlePromotions} className="flex w-full gap-4 shrink-0">
                        <input
                            type="text"
                            className="neo-input flex-1 py-4 text-xl"
                            placeholder="Co chcesz wyszukać?"
                            value={searchedProduct}
                            onChange={(e) => {
                                setSearchedProduct(e.target.value);
                                setHasSearched(false);
                            }
                            }
                        ></input>
                        <button type="submit"
                            className="neo-btn flex items-center justify-center rounded-xl text-xl uppercase px-8 py-3 
                            hover:bg-yellow-300 hover:-translate-y-1 hover:-translate-x-1 shadow-[0px_0px_0px_0px_#000] hover:shadow-[4px_4px_0px_0px_#000] transition-all active:translate-y-0 active:translate-x-0 active:shadow-none" disabled={isLoading} >{isLoading ? "Szukam..." : "Wyszukaj"}
                        </button>
                    </form>
                    <div className="flex flex-col w-full p-5">
                        {isLoading && (



                            <div className="text-center text-3xl font-black mt-10 mb-10 animate-pulse">
                                Ładowanie promocji...
                            </div>
                        )}

                        {!isLoading && hasSearched && promotions.length === 0 && (
                            <div className="neo-empty-state">
                                <span className="text-4xl mb-4">🔁</span>
                                <span className="text-xl font-bold uppercase text-center">Brak wyników. Spróbuj wyszukać inny produkt!</span>
                            </div>

                        )}

                        {!isLoading && !hasSearched && promotions.length === 0 && (
                            <div className="neo-empty-state">
                                <span className="text-4xl mb-4">📉</span>
                                <span className="text-xl font-bold uppercase text-center">Tutaj pojawią się promocje. Wyszukaj produkt!</span>
                            </div>

                        )}

                        {!isLoading && promotions.length > 0 && (
                            <div className="neo-promo-grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 content-start h-full pr-2 pb-2">





                                {promotions.map(promo => (
                                    <div id="promotion" key={promo.id} className="flex flex-col h-full bg-white border-4 border-black rounded-xl p-1 shadow-[4px_4px_0px_0px_#000]">
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



                                        <div className="mt-auto -m-1 bg-yellow-400 border-t-4 border-black p-2 pt-3 rounded-b-lg flex flex-col gap-1">


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
                                ))}

                            </div>)}
                    </div>
                </section>
                {/* Przycisk powrotu */}
                <div className="flex justify-center w-full mt-2">
                    <button type="button" onClick={() => navigate("/home")} className="bg-yellow-100 w-full max-w-xs neo-btn py-3 px-8 text-xl hover:bg-yellow-200">
                        &#10094; Powrót
                    </button>
                </div>

            </div >

        </div >
    )
}