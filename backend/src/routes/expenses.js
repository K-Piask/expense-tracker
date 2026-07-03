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

router.get("/:id", auth, async (req, res) => {
    try {
        const expense = await prisma.expense.findFirst({
            where: {
                id: Number(req.params.id),
                userId: req.user.id
            },
            include: {
                category: true,
                shoppingList: {
                    include: {
                        shoppingListItems: {
                            orderBy: {
                                id: "asc"
                            }
                        }
                    }
                },
                expenseItems: {
                    orderBy: {
                        id: "asc"
                    }
                }
            }
        });

        if (!expense) {
            return res.status(404).json({ error: "Nie znaleziono wydatku lub brak uprawnień." });
        }

        res.json(expense);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Błąd podczas pobierania wydatku." });
    }
});




router.post("/", auth, async (req, res) => {
    try {

        const { date, note, categoryId, expenseItems = [], shoppingListId } = req.body;

        if (!date) {
            return res.status(400).json({ error: "Data jest wymagana." });
        }


        const result = await prisma.$transaction(async (tx) => {

            let finalExpenseItems = [...expenseItems];

            if (shoppingListId) {
                const shoppingList = await tx.shoppingList.findUnique({
                    where: { id: Number(shoppingListId) },
                    include: { shoppingListItems: true }
                });

                if (shoppingList && shoppingList.shoppingListItems) {
                    const itemsFromList = shoppingList.shoppingListItems.filter(item => item.isBought === true).map(item => ({
                        name: item.name,
                        amount: 0
                    }));

                    finalExpenseItems = [...finalExpenseItems, ...itemsFromList];
                }

                await tx.shoppingList.update({
                    where: { id: Number(shoppingListId) },
                    data: { isDone: true }
                });

            }

            const calculatedTotal = finalExpenseItems.reduce((sum, item) => sum + Number(item.amount), 0);


            const expense = await tx.expense.create({
                data: {
                    totalAmount: calculatedTotal,
                    date: new Date(date),
                    note: note ? String(note) : null,
                    userId: req.user.id,
                    categoryId: categoryId ? Number(categoryId) : null,
                    shoppingListId: shoppingListId ? Number(shoppingListId) : null,
                    expenseItems: {
                        create: finalExpenseItems
                    }

                }
            });
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
        const expenseId = Number(req.params.id);
        const userId = req.user.id;

        const existingExpense = await prisma.expense.findFirst({
            where: {
                id: expenseId,
                userId: userId
            }
        });

        if (!existingExpense) {
            return res.status(404).json({ error: "Nie znaleziono wydatku lub brak uprawnień." });
        }

        await prisma.$transaction(async (tx) => {
            await tx.expense.delete({
                where: { id: expenseId }
            });

            if (existingExpense.shoppingListId) {
                await tx.shoppingList.delete({
                    where: { id: existingExpense.shoppingListId }
                });
            }
        });

        res.status(200).json({
            message: "Wydatek oraz powiązana lista zostały usunięte.",
            deletedId: expenseId
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Błąd podczas usuwania wydatku." })
    }
});

router.put("/:id", auth, async (req, res) => {
    try {
        const { date, note, categoryId, expenseItems = [], shoppingListId } = req.body;
        const expenseId = Number(req.params.id);

        const existingExpense = await prisma.expense.findFirst({
            where: {
                id: expenseId,
                userId: req.user.id
            }
        });

        if (!existingExpense) {
            return res.status(404).json({ error: "Nie znaleziono wydatku lub brak uprawnień." });
        }

        const targetShoppingListId = shoppingListId ? Number(shoppingListId) : null;
        const oldShoppingListId = existingExpense.shoppingListId;
        const isListChanged = oldShoppingListId !== targetShoppingListId;

        const updatedExpense = await prisma.$transaction(async (tx) => {
            let incomingItems = [...expenseItems];

            if (isListChanged) {

                if (oldShoppingListId) {
                    await tx.shoppingList.update({
                        where: { id: oldShoppingListId },
                        data: { isDone: false }
                    });

                    const oldList = await tx.shoppingList.findUnique({
                        where: { id: oldShoppingListId },
                        include: { shoppingListItems: true }
                    });

                    if (oldList && oldList.shoppingListItems) {
                        const oldItemNames = oldList.shoppingListItems.map(item => item.name);

                        await tx.expenseItem.deleteMany({
                            where: {
                                expenseId: expenseId,
                                name: { in: oldItemNames }
                            }
                        });

                        incomingItems = incomingItems.filter(item => !oldItemNames.includes(item.name));
                    }
                }

                if (targetShoppingListId) {
                    await tx.shoppingList.update({
                        where: { id: targetShoppingListId },
                        data: { isDone: true }
                    });

                    const newList = await tx.shoppingList.findUnique({
                        where: { id: targetShoppingListId },
                        include: { shoppingListItems: true }
                    });

                    if (newList && newList.shoppingListItems) {
                        const newItemsToCreate = newList.shoppingListItems.filter(item => item.isBought === true).map(item => ({
                            name: item.name,
                            amount: 0
                        }));

                        incomingItems = [...incomingItems, ...newItemsToCreate];
                    }
                }
            }

            const itemsToUpdate = incomingItems.filter(item => item.id != null);
            const itemsToCreate = incomingItems.filter(item => item.id == null);
            const incomingIds = itemsToUpdate.map(item => item.id);

            const calculatedTotal = incomingItems.reduce((sum, item) => sum + Number(item.amount), 0);

            await tx.expense.update({
                where: {
                    id: expenseId,
                },
                data: {
                    totalAmount: calculatedTotal,
                    date: new Date(date),
                    note: note ? String(note) : null,
                    categoryId: categoryId ? Number(categoryId) : null,
                    shoppingListId: targetShoppingListId,
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
                }
            });
            return tx.expense.findFirst({
                where: {
                    id: expenseId,
                    userId: req.user.id
                },
                include: {
                    category: true,
                    shoppingList: {
                        include: {
                            shoppingListItems: {
                                orderBy: {
                                    id: "asc"
                                }
                            }
                        }
                    },
                    expenseItems: {
                        orderBy: {
                            id: "asc"
                        }
                    }
                }
            });


        });
        res.status(200).json(updatedExpense);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Błąd podczas aktualizacji wydatku." })
    }
});

module.exports = router;