import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3000";
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

                <section className="neo-section flex flex-col gap-5 h-[70vh] w-full">
                    <label className="neo-label text-3xl text-center tracking-tight">Wyszukiwarka Promocji</label>
                    <div className="h-1 w-full bg-black shrink-0"></div>
                    <form onSubmit={handlePromotions} className="flex w-full gap-2 shrink-0">
                        <input
                            type="text"
                            className="neo-input w-3/4"
                            placeholder="Co chcesz wyszukać?"
                            value={searchedProduct}
                            onChange={(e) => {
                                setSearchedProduct(e.target.value);
                                setHasSearched(false);
                            }
                            }
                        ></input>
                        <button type="submit" className="neo-btn w-1/4 mb-1 py-0 text-xl hover:bg-yellow-300" disabled={isLoading} >{isLoading ? "Szukam..." : "Wyszukaj"}</button>
                    </form>
                    <div className="flex flex-col w-full h-3/4 p-5 border-4 border-black rounded-xl bg-gray-200 min-h-0">
                        <div className="grid grid-cols-4 content-start gap-4 w-full h-full overflow-y-auto pr-2 pb-2 custom-scrollbar">
                            {isLoading && (

                                <div className="col-span-4 text-center text-2xl font-black mt-10">
                                    Ładowanie promocji...
                                </div>)}

                            {!isLoading && hasSearched && promotions.length === 0 && (
                                <div className="col-span-4 text-center text-2xl font-black mt-10">
                                    Brak wyników. Spróbuj poszukać czegoś innego!
                                </div>
                            )}

                            {!isLoading && !hasSearched && promotions.length === 0 && (
                                <div className="col-span-4 text-center text-2xl font-black mt-10">
                                    Tutaj pojawią się promocję. Wyszukaj coś!
                                </div>
                            )}

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

                        </div>
                    </div>
                </section>
                <div className="flex justify-center gap-4">

                    <button type="button" onClick={() => navigate("/dashboard")} className="bg-yellow-100 neo-btn py-2 hover:bg-yellow-200 w-1/2">&#128281; Powrót na Stronę Główną</button>
                </div>

            </div >

        </div >
    )
}