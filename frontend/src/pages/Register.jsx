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
        <div className="flex flex-col items-center justify-start min-h-screen w-full bg-linear-to-br from-slate-500 via-slate-700 to-slate-900 p-4 md:p-10">
            <div className="w-full max-w-2xl flex flex-col gap-6">
                <div className="relative py-4">
                    <h1 className=" relative z-10 mx-auto table text-center text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic leading-none pt-2 pb-4 px-10 my-6 
        before:content-[''] before:absolute before:inset-0 before:-z-10 before:bg-slate-950 before:-skew-x-11 before:rounded-2xl shadow-2xl">
                        Expense Tracker</h1>
                </div>
                {error && (
                    <div className="bg-red-400 border-4 border-black p-4 rounded-2xl font-black text-black shadow-[4px_4px_0px_0px_#000] flex justify-between">
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
                                placeholder="*****"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            ></input>
                        </div>
                        <div className="flex flex-col">
                            <label className="neo-label text-xl">Powtórz Hasło</label>
                            <input
                                type="password"
                                className="neo-input"
                                placeholder="*****"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            ></input>
                        </div>
                    </section>
                    <div className="flex flex-col gap-4">
                        <button type="submit" className="neo-btn mt-4 py-4 text-2xl hover:bg-yellow-300" disabled={isLoading} >{isLoading ? "Rejestracja..." : "Zarejestruj się"}</button>
                        <button type="button" onClick={() => navigate("/login")} className="bg-yellow-100 neo-btn py-2 hover:bg-yellow-200">Powrót do logowania</button>
                    </div>
                </form>
            </div>

        </div>
    )
}