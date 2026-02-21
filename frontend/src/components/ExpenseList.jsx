export default function ExpenseList({ expenses }) {
    return (
        <div>
            <h2>Wydatki: {expenses.length}</h2>
            <pre>{JSON.stringify(expenses, null, 2)}</pre>
        </div>
    )
}