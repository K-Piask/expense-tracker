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
        const amountGrosze = Math.round(Number(formAmount) * 100);


        const payload = {
            amount: amountGrosze,
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

        <div>
            <h2>Dodaj</h2>
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8, maxWidth: 420 }}>
                <input
                    type="number"
                    step="0.01"
                    placeholder="Kwota (zł), np. 12.99"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                />

                <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Notatka (opcjonalnie)"
                    value={formNote}
                    onChange={(e) => setFormNote(e.target.value)}
                />
                <select value={formCategoryId} onChange={(e) => setFormCategoryId(e.target.value)}>
                    <option value="">(brak kategorii)</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
                <button type="submit">Dodaj wydatek</button>
            </form>

        </div>
    );
}