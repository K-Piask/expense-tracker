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
        const { from, to, categoryId } = req.query;

        const where = { userId: 1 };
        if (from || to) {
            where.date = {};
            if (from) {
                const start = new Date(from);
                start.setHours(0, 0, 0, 0);
                where.date.gte = start;
            }
            if (to) {
                const end = new Date(to);
                end.setHours(23, 59, 59, 999);
                where.date.lte = end;
            }
        }
        if (categoryId) {
            where.categoryId = Number(categoryId);
        }
        const expenses = await prisma.expense.findMany({
            where,
            include: { category: true },
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

        const { amount, date, note, categoryId } = req.body;

        if (!amount || !date) {
            return res.status(400).json({ error: "amount i date są wymagane" });
        }

        const expense = await prisma.expense.create({
            data: {
                amount: Number(amount),
                date: new Date(date),
                note: note ? String(note) : null,
                userId: 1, //tymczasowo
                categoryId: categoryId ? Number(categoryId) : null,
            },
        });
        res.status(201).json(expense);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Błąd dodawania wydatku" });
    }

});

app.get("/categories", async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            where: { userId: 1 }, //tymczasowo
            orderBy: { name: "asc" },
        });
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Błąd pobierania kategorii" });
    }
});

app.post("/categories", async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !String(name).trim()) {
            return res.status(400).json({ error: "name jest wymagane" });
        }

        const category = await prisma.category.create({
            data: {
                name: String(name).trim(),
                userId: 1, //tymczasowo
            },
        });
        res.status(201).json(category);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Błąd dodawania kategorii" });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`API działa na http://localhost:${PORT}`);
});