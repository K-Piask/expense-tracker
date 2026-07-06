import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;
export default function Home() {
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [monthlySpend, setMonthlySpend] = useState(0);

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


    useEffect(() => {
        setError("");
        const headers = getAuthHeaders();
        if (!headers) {
            navigate("/login");
            return;
        }
        fetch(`${API}/api/expenses/monthly-sum`, { headers })
            .then((res) => {
                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    throw new Error('Wygasła sesja');
                }
                return res.json();
            })
            .then((data) => {
                setMonthlySpend(data.total || "0.00");
                setIsLoading(false);
            })
            .catch(() => {
                setError("Nie udało się pobrać sumy wydaktów");
                setIsLoading(false);
            })

    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        setError("");
        setMonthlySpend(0);
        navigate("/login");
    }
    return (
        <div className="neo-page-shell">
            <div className="w-full max-w-3xl flex flex-col gap-1 md:gap-6">

                <div className="relative py-1">
                    <h1 onClick={() => navigate('/home')} className="neo-brand-title">
                        Expense Tracker
                    </h1>
                </div>

                {error && (
                    <div className="neo-alert">
                        <span>BŁĄD: {error}</span>
                        <button onClick={() => setError("")} className="hover:scale-110 text-3xl font-black leading-none pb-1">×</button>
                    </div>
                )}

                <section className="neo-section items-center p-6 md:p-8">

                    <div className="flex flex-col items-center w-full mb-2 md:mb-4">
                        <h2 className="font-black text-2xl md:text-4xl uppercase tracking-tighter mb-2">Witaj!</h2>
                        <span className="text-base md:text-xl font-bold uppercase text-slate-600 tracking-tight">W tym miesiącu wydano:</span>

                        <div className="bg-yellow-300 border-4 border-black px-4 md:px-6 py-2 md:py-4 mt-3 md:mt-6 md:mb-2 shadow-[5px_5px_0px_0px_#000] -rotate-2 hover:rotate-0 transition-transform">
                            <span className="font-black text-2xl md:text-4xl tracking-tighter wrap-break-word">
                                {isLoading ? "..." : `${monthlySpend}`}
                            </span>
                            <span className="text-xl font-black uppercase ml-2">PLN</span>
                        </div>
                    </div>

                    <div className="h-1 w-full bg-black shrink-0 mb-2 md:mb-4"></div>

                    <div className="flex flex-col w-full gap-5">

                        <button
                            type="button"
                            onClick={() => navigate("/expenses")}
                            className="neo-btn bg-green-400 hover:bg-green-500 w-full py-3 md:py-5 flex items-center justify-center gap-2 border-5 shadow-[5px_5px_0px_0px_#000]"
                        >
                            <span className="text-3xl md:text-5xl drop-shadow-[4px_4px_0px_#000]">💸</span>
                            <span className="text-xl md:text-3xl tracking-tighter">Zarządzaj Wydatkami</span>
                        </button>

                        <div className="grid grid-cols-2 gap-5 w-full">
                            <button
                                type="button"
                                onClick={() => navigate("/shopping-lists")}
                                className="neo-btn bg-cyan-300 hover:bg-cyan-400 py-4 flex flex-col md:flex-row items-center justify-center gap-3"
                            >
                                <span className="text-2xl md:text-3xl drop-shadow-[4px_4px_0px_#000]">📋</span>
                                <span className="text-lg md:text-xl">Listy Zakupów</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate("/categories")}
                                className="neo-btn bg-purple-300 hover:bg-purple-400 py-4 flex flex-col md:flex-row items-center justify-center gap-3"
                            >
                                <span className="text-2xl md:text-3xl drop-shadow-[4px_4px_0px_#000]">📁</span>
                                <span className="text-lg md:text-xl">Kategorie</span>
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate("/promotions")}
                            className="neo-btn bg-pink-300 hover:bg-pink-400 py-4 flex items-center justify-center gap-3 border-dashed"
                        >
                            <span className="text-2xl md:text-3xl drop-shadow-[4px_4px_0px_#000]">🔍</span>
                            <span className="text-base md:text-xl">Wyszukaj promocję na szybko</span>
                        </button>

                    </div>
                </section>



            </div>
            <div className="flex justify-center w-full mt-10 md:mt-8">
                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex neo-btn bg-red-400 hover:bg-red-500 py-3 px-8 "
                >
                    <span>&#10094; Wyloguj się</span>
                </button>
            </div>
        </div>
    )
}