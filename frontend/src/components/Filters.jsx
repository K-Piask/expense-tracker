export default function Filters({
    categories,
    filterCategoryId,
    setFilterCategoryId,
    filterFrom,
    setFilterFrom,
    filterTo,
    setFilterTo,
    onClear,
}) {
    return (
        <div>
            <h2>Kategorie: {categories.length}</h2>
            <select
                value={filterCategoryId}
                onChange={(e) => setFilterCategoryId(e.target.value)}
            >

                <option value="">(wszystkie)</option>
                {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.name}
                    </option>
                ))}
            </select>

            <div>
                <label>Od: </label><input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} />
                <label>Do: </label><input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} />
            </div>
            <button type="button" onClick={onClear}>Wyczysć filtry</button>
        </div>
    );
}