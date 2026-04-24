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
        res.status(500).json({ error: "Error loading expenses" });
    }
});

router.post("/", auth, async (req, res) => {
    try {

        const { date, note, categoryId, expenseItems = [], shoppingListId } = req.body;

        if (!date) {
            return res.status(400).json({ error: "date is required" });
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
        res.status(500).json({ error: "Error inserting expense" });
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
            return res.status(404).json({ error: "Expense not found or unauthorized" })
        }

        res.status(200).json({
            message: "Expense has been deleted",
            deletedId: Number(req.params.id)
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error deleting expense" })
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
            return res.status(404).json({ error: "Expense not found or unauthorized" });
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
        res.status(500).json({ error: "Error updating expense" })
    }
});

module.exports = router;