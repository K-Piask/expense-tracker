export default function Filters({ categories, filterCategoryId, setFilterCategoryId, filterFrom, setFilterFrom, filterTo, setFilterTo, onClear }) {
    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-black italic uppercase border-b-4 border-black pb-2 inline-block w-fit">
                Filtrowanie
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div className="flex flex-col">
                    <label className="neo-label">Kategoria</label>
                    <select
                        className="neo-input w-full"
                        value={filterCategoryId}
                        onChange={(e) => setFilterCategoryId(e.target.value)}
                    >
                        <option value="">(Wszystkie)</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>


                <div className="flex flex-col">
                    <label className="neo-label text-blue-600">Data Od</label>
                    <input
                        type="date"
                        className="neo-input w-full"
                        value={filterFrom}
                        onChange={(e) => setFilterFrom(e.target.value)}
                    />
                </div>


                <div className="flex flex-col">
                    <label className="neo-label text-red-600">Data Do</label>
                    <input
                        type="date"
                        className="neo-input w-full"
                        value={filterTo}
                        onChange={(e) => setFilterTo(e.target.value)}
                    />
                </div>
            </div>

            <button type="button" onClick={onClear} className="neo-btn bg-slate-100 hover:bg-white w-full md:w-auto self-end">
                Wyczyść filtry ×
            </button>
        </div>
    );
}