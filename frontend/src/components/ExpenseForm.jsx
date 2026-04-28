import { useState } from "react";

export default function ExpenseForm({ categories, onAdd }) {
    const [formAmount, setFormAmount] = useState("");
    const [formDate, setFormDate] = useState("");
    const [formNote, setFormNote] = useState("");
    const [formCategoryId, setFormCategoryId] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        //walidacja minimum
        if (!formAmount || !String(formAmount).trim()) return;
        if (!formDate) return;

        //zamiana zł na grosze
        const amountZloty = Math.round(Number(formAmount) * 100);


        const payload = {
            totalAmount: amountZloty,
            date: formDate,
            note: formNote || null,
            categoryId: formCategoryId ? Number(formCategoryId) : null,
        };

        const ok = await onAdd(payload);

        if (ok) {
            // czyścimy pola po dodaniu (UI)
            setFormAmount("");
            setFormDate("");
            setFormNote("");
            setFormCategoryId("");
        }
    };

    return (

        <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-black italic uppercase">Dodaj Nowy Wydatek</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Kwota i Data obok siebie */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <label className="neo-label">Kwota (zł)</label>
                        <input
                            type="number"
                            step="0.01"
                            className="neo-input"
                            placeholder="0.00"
                            value={formAmount}
                            onChange={(e) => setFormAmount(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="neo-label">Kiedy?</label>
                        <input
                            type="date"
                            className="neo-input"
                            value={formDate}
                            onChange={(e) => setFormDate(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-col">
                    <label className="neo-label">Co to było? (Notatka)</label>
                    <input
                        type="text"
                        className="neo-input"
                        placeholder="np. Zakupy w Biedronce"
                        value={formNote}
                        onChange={(e) => setFormNote(e.target.value)}
                    />
                </div>

                <div className="flex flex-col">
                    <label className="neo-label">Wybierz Kategorię</label>
                    <select
                        className="neo-input"
                        value={formCategoryId}
                        onChange={(e) => setFormCategoryId(e.target.value)}
                    >
                        <option value="">(Brak kategorii)</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <button type="submit" className="neo-btn mt-4 py-4 text-2xl hover:bg-yellow-300">
                    DODAJ WYDATEK +
                </button>
            </form>
        </div>
    );
}