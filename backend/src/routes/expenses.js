const express = require("express");
const prisma = require("../db/prisma");

const router = express.Router();

router.get("/", async (req, res) => {
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

router.post("/", async (req, res) => {
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

module.exports = router;