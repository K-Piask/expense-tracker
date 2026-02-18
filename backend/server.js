require("dotenv").config();

const express = require("express");
const cors = require("cors");


const { PrismaClient } = require("./generated/prisma");
const { PrismaPg } = require("@prisma/adapter-pg")

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ ok: true, message: "Backend działa 🚀" });
});

app.get("/expenses", async (req, res) => {
    try {
        const expenses = await prisma.expense.findMany({
            orderBy: { date: "desc" },
        });
        res.json(expenses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Błąd pobierania wydatków" });
    }
});

app.post("/expenses", async (req, res) => {
    try {
        const { amount, date, note } = req.body;

        if (!amount || !date) {
            return res.status(400).json({ error: "amount i date są wymagane" });
        }

        const expense = await prisma.expense.create({
            data: {
                amount: Number(amount),
                date: new Date(date),
                note: note ? String(note) : null,
                userId: 1, //tymczasowo
            },
        });
        res.status(201).json(expense);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Błąd dodawania wydatku" });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`API działa na http://localhost:${PORT}`);
});