import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:3000";
export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Hasła nie są identyczne!");
            return;
        }
        setIsLoading(true);
        const url = `${API}/api/auth/register`;
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            if (!res.ok) {
                throw new Error("Wystąpił błąd podczas rejestracji");
            }
            navigate("/login");
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
                        Expense Tracker
                    </h1>
                </div>



                {error && (
                    <div className="neo-alert">
                        <span>BŁĄD: {error}</span>
                        <button onClick={() => setError("")} className="hover:scale-110">×</button>
                    </div>
                )}
                <form onSubmit={handleRegister}>
                    <section className="neo-section flex flex-col gap-5">
                        <label className="neo-label text-3xl text-center tracking-tight">Rejestracja</label>
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
                        <div className="flex flex-col">
                            <label className="neo-label text-xl">Powtórz Hasło</label>
                            <input
                                type="password"
                                className="neo-input"
                                placeholder="••••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            ></input>
                        </div>
                    </section>
                    <div className="flex flex-col gap-4 mt-2 w-full max-w-sm mx-auto">
                        <button type="submit" className="neo-btn mt-4 py-3 px-8 text-2xl hover:bg-yellow-300" disabled={isLoading} >{isLoading ? "Rejestracja..." : "Zarejestruj się"}</button>
                        <button type="button" onClick={() => navigate("/login")} className="neo-btn w-full py-2 text-lg bg-yellow-100 hover:bg-yellow-200">Powrót do logowania</button>
                    </div>
                </form>
            </div>

        </div>
    )
}