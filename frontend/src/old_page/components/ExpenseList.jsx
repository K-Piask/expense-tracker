export default function ExpenseList({ expenses }) {
    if (!expenses.length) {
        return (
            <div className="text-center py-10">
                <p className="text-xl font-black uppercase italic text-slate-500">Brak wydatków na liście</p>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Dodaj coś poniżej lub zmień filtry!
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5">
            <div className="flex justify-between items-end px-1">
                <h2 className="text-2xl font-black italic uppercase">Twoje Wydatki</h2>
                <span className="bg-black text-white px-3 py-1 rounded-lg font-black text-sm uppercase tracking-tighter">
                    Liczba pozycji: {expenses.length}
                </span>
            </div>

            <div className="overflow-x-auto border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_#000]">
                <table className="w-full text-left border-collapse bg-white">
                    <thead className="bg-black text-white border-b-4 border-black">
                        <tr>
                            <th className="px-4 py-4 font-black uppercase text-xs tracking-widest">Data</th>
                            <th className="px-4 py-4 font-black uppercase text-xs tracking-widest">Kategoria</th>
                            <th className="px-4 py-4 font-black uppercase text-xs tracking-widest">Notatka</th>
                            <th className="px-4 py-4 font-black uppercase text-xs tracking-widest text-right">Kwota</th>
                        </tr>
                    </thead>


                    <tbody className="divide-y-4 divide-black">
                        {expenses.map((expense) => (
                            <tr key={expense.id} className="hover:bg-yellow-50 transition-colors group">

                                <td className="px-4 py-4 font-mono font-bold text-lg border-r-4 border-black">
                                    {new Date(expense.date).toISOString().slice(0, 10)}
                                </td>


                                <td className="px-4 py-4 border-r-4 border-black">
                                    <span className="bg-blue-100 border-2 border-black px-2 py-0.5 rounded-md font-black text-[10px] uppercase inline-block">
                                        {expense.category?.name || "-"}
                                    </span>
                                </td>


                                <td className="px-4 py-4 border-r-4 border-black font-bold text-base italic text-slate-900">
                                    {expense.note || "-"}
                                </td>


                                <td className="px-4 py-4 text-right font-black text-2xl group-hover:text-blue-600 transition-colors">
                                    {expense.totalAmount}
                                    <span className="text-xs ml-1 font-bold">PLN</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}