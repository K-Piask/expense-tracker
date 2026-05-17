import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3000";
export default function Home() {
    const [error, setError] = useState("");
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

            })
            .catch(() => setError("Nie udało się pobrać sumy wydaktów"));


    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        setError("");
        setMonthlySpend(0);
        navigate("/login");
    }
    return (
        <div className="neo-background">
            <div className="w-full max-w-3xl flex flex-col gap-6">
                <div className="relative py-1">
                    <h1 className="neo-logo">
                        Expense Tracker</h1>
                </div>

                {error && (
                    <div className="neo-error">
                        <span>BŁĄD: {error}</span>
                        <button onClick={() => setError("")} className="hover:scale-110">×</button>
                    </div>
                )}

                <section className="neo-section  flex flex-col gap-5 w-full">
                    <div>
                        <label className="neo-label text-4xl text-center tracking-tight">Witaj!</label>
                        <label className="neo-label text-2xl text-center tracking-tight">W tym miesiącu wydano:</label>
                        <label className="neo-label text-3xl text-center tracking-tight">{monthlySpend} ZŁ</label>
                    </div>
                    <div className="h-1 w-full bg-black shrink-0"></div>
                    <div className="flex flex-col w-full h-full gap-4">
                        <button type="button" onClick={() => navigate("/promotions")} className=" neo-btn text-2xl h-15 hover:bg-yellow-300">&#128269; Wyszukaj promocję</button>
                        <button type="button" onClick={() => navigate("/dashboard")} className=" neo-btn text-2xl h-15 hover:bg-yellow-300">&#128193; Kategorie wydatków</button>
                        <button type="button" onClick={() => navigate("/shopping-lists")} className=" neo-btn text-2xl h-15 hover:bg-yellow-300">&#128203; Listy Zakupów</button>
                        <button type="button" onClick={() => navigate("/dashboard")} className=" neo-btn text-2xl h-15 hover:bg-yellow-300">&#128184; Wydatki</button>
                    </div>
                </section>
                <div className="flex justify-center gap-4">

                    <button type="button" onClick={handleLogout} className="bg-red-300 neo-btn py-2 hover:bg-red-400 w-1/3">Wyloguj się</button>
                </div>
            </div>
        </div>
    )
}