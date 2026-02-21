export default function ExpenseList({ expenses }) {
    if (!expenses.length) {
        return <p>Brak wydatków.</p>;
    }

    return (
        <div>
            <h2>Wydatki: {expenses.length}</h2>
            {/*<pre>{JSON.stringify(expenses, null, 2)}</pre>*/}
            <table border="1" style={{ borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        <th style={thStyle}>Data</th>
                        <th style={thStyle}>Kategoria</th>
                        <th style={thStyle}>Notatka</th>
                        <th style={thStyle}>Kwota (zł)</th>
                    </tr>
                </thead>
                <tbody>
                    {expenses.map((expense) => (
                        <tr key={expense.id}>
                            <td style={tdStyle}>{new Date(expense.date).toISOString().slice(0, 10)}</td>
                            <td style={tdStyle}>{expense.category?.name || "-"}</td>
                            <td style={tdStyle}>{expense.note || "-"}</td>
                            <td style={tdStyle}>{(expense.amount / 100).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div >
    )
}

const thStyle = {
    borderBottom: "1px solid #FFFFFF",
    padding: "10px 20px 10px 20px",
};

const tdStyle = {
    borderBottom: "1px solid #FFFFFF",
    padding: "8px",
}