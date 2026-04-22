const express = require("express");
const router = express.Router();

const prisma = require("../db/prisma");

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
        res.status(500).json({ error: "Error loading expenses" });
    }
});

router.post("/", async (req, res) => {
    try {

        const { totalAmount, date, note, categoryId, expenseItems, shoppingListId } = req.body;

        if (!totalAmount || !date) {
            return res.status(400).json({ error: "totalAmount and date are required" });
        }
        /*
                const expense = await prisma.expense.create({
                    data: {
                        amount: Number(amount),
                        date: new Date(date),
                        note: note ? String(note) : null,
                        userId: 1, //tymczasowo
                        categoryId: categoryId ? Number(categoryId) : null,
                    },
                });
                */
        const result = await prisma.$transaction(async (tx) => {
            const expense = await tx.expense.create({
                data: {
                    totalAmount: Number(totalAmount),
                    date: new Date(date),
                    note: note ? String(note) : null,
                    userId: 1,
                    categoryId: categoryId ? Number(categoryId) : null,
                    expenseItems: {
                        create: expenseItems
                    },
                    shoppingListId: shoppingListId ? Number(shoppingListId) : null
                }
            })
            if (shoppingListId) {
                await tx.shoppingList.update({
                    where: {
                        id: Number(shoppingListId)
                    },
                    data: {
                        isDone: true
                    }
                })
            }
            return expense;
        });

        res.status(201).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error inserting expense" });
    }

});

module.exports = router;