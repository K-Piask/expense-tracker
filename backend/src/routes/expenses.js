const express = require("express");
const router = express.Router();

const prisma = require("../db/prisma");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
    try {
        const { from, to, categoryId } = req.query;

        const where = { userId: req.user.id };
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
            include: {
                category: true,
                shoppingList: true,
                expenseItems: true
            },
            orderBy: { date: "desc" },
        });
        res.json(expenses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Błąd podczas pobierania wydatków." });
    }
});

router.get("/monthly-sum", auth, async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const expenses = await prisma.expense.findMany({
            where: {
                userId: req.user.id,
                date: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            }
        });

        const total = expenses.reduce((sum, expense) => {
            return sum + (Number(expense.totalAmount) || 0);

        }, 0);

        res.json({ total: total.toFixed(2) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Błąd podczas sumowania wydatków." });
    }
});

router.post("/", auth, async (req, res) => {
    try {

        const { date, note, categoryId, expenseItems = [], shoppingListId } = req.body;

        if (!date) {
            return res.status(400).json({ error: "Data jest wymagana." });
        }

        const calculatedTotal = expenseItems.reduce((sum, item) => sum + Number(item.amount), 0);

        const result = await prisma.$transaction(async (tx) => {
            const expense = await tx.expense.create({
                data: {
                    totalAmount: calculatedTotal,
                    date: new Date(date),
                    note: note ? String(note) : null,
                    userId: req.user.id,
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
        res.status(500).json({ error: "Błąd podczas dodawania wydatku." });
    }

});

router.delete("/:id", auth, async (req, res) => {
    try {
        const result = await prisma.expense.deleteMany({
            where: {
                id: Number(req.params.id),
                userId: req.user.id
            }
        });
        if (result.count === 0) {
            return res.status(404).json({ error: "Nie znaleziono wydatku lub brak uprawnień." })
        }

        res.status(200).json({
            message: "Wydatek został usunięty.",
            deletedId: Number(req.params.id)
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Błąd podczas usuwania wydatku." })
    }
});

router.put("/:id", auth, async (req, res) => {
    try {
        const { date, note, categoryId, expenseItems = [], shoppingListId } = req.body;
        const expenseId = req.params.id;

        const existingExpense = await prisma.expense.findFirst({
            where: {
                id: Number(expenseId),
                userId: req.user.id
            }
        });

        if (!existingExpense) {
            return res.status(404).json({ error: "Nie znaleziono wydatku lub brak uprawnień." });
        }

        const calculatedTotal = expenseItems.reduce((sum, item) => sum + Number(item.amount), 0);
        const itemsToUpdate = expenseItems.filter(item => item.id != null);
        const itemsToCreate = expenseItems.filter(item => item.id == null);

        const incomingIds = itemsToUpdate.map(item => item.id);

        const updatedExpense = await prisma.expense.update({
            where: {
                id: Number(expenseId),
            },
            data: {
                totalAmount: calculatedTotal,
                date: new Date(date),
                note: note ? String(note) : null,
                categoryId: categoryId ? Number(categoryId) : null,
                shoppingListId: shoppingListId ? Number(shoppingListId) : null,
                expenseItems: {
                    deleteMany: {
                        id: {
                            notIn: incomingIds
                        }
                    },
                    update: itemsToUpdate.map(item => ({
                        where: { id: item.id },
                        data: { name: item.name, amount: Number(item.amount) }
                    })),
                    create: itemsToCreate.map(item => ({
                        name: item.name, amount: Number(item.amount)
                    }))

                }
            },
            include: { expenseItems: true }
        });
        res.status(200).json(updatedExpense);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Błąd podczas aktualizacji wydatku." })
    }
});

module.exports = router;