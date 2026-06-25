import { useState } from "react";
import { useNavigate } from "react-router-dom";


const API = "http://localhost:3000";
export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        const url = `${API}/api/auth/login`;
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            if (!res.ok) {
                throw new Error("Nieprawidłowe dane logowania");
            }
            const data = await res.json();
            localStorage.setItem("token", data.token)
            navigate("/home");
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <div className="neo-page-shell">
            <div className="neo-auth-shell">
                <div className="relative py-1">
                    <h1 onClick={() => navigate('/home')} className="neo-brand-title cursor-pointer">
                        Expense Tracker</h1>
                </div>
                {error && (
                    <div className="neo-alert">
                        <span>BŁĄD: {error}</span>
                        <button onClick={() => setError("")} className="hover:scale-110">×</button>
                    </div>
                )}
                <form onSubmit={handleLogin}>
                    <section className="neo-section flex flex-col gap-5">
                        <label className="neo-label text-3xl text-center tracking-tight">Logowanie</label>
                        <div className="h-1 w-full bg-black"></div>
                        <div className="flex flex-col">
                            <label className="neo-label text-xl">E-mail</label>
                            <input
                                type="email"
                                className="neo-input"
                                placeholder="adres@domena.pl"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            ></input>
                        </div>
                        <div className="flex flex-col">
                            <label className="neo-label text-xl">Hasło</label>
                            <input
                                type="password"
                                className="neo-input"
                                placeholder="••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            ></input>
                        </div>
                    </section>
                    <div className="flex flex-col gap-4 mt-2 w-full max-w-sm mx-auto">

                        <button type="submit" className="neo-btn mt-4 py-3 px-8 text-2xl hover:bg-yellow-300" disabled={isLoading} >{isLoading ? "Logowanie..." : "Zaloguj się"}</button>
                        <button type="button" onClick={() => navigate("/register")} className="neo-btn w-full py-2 text-lg bg-yellow-100 hover:bg-yellow-200">Nie masz konta? Zarejestruj się</button>

                    </div>
                </form >
            </div >

        </div >
    )
}