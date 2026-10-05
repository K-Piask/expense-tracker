const express = require("express");
const router = express.Router();
const prisma = require("../db/prisma");
const webhookAuth = require("../middleware/webhookAuth");

router.post("/receipts", webhookAuth, async (req, res) => {
    try {
        const { email, expenses } = req.body;

        if (!email || !expenses || !Array.isArray(expenses)) {
            return res.status(400).json({ error: 'Nieprawidłowy format danych.' });
        }

        const user = await prisma.user.findUnique({
            where: { email: email }
        });

        if (!user) {
            return res.status(404).json({ error: "Nie znaleziono użytkownika." });
        }

        await Promise.all(expenses.map(async (e) => {
            return prisma.expense.create({
                data: {
                    totalAmount: e.totalAmount,
                    date: new Date(e.date),
                    note: null,
                    userId: user.id,
                    categoryId: e.categoryId ? Number(e.categoryId) : null,
                    shoppingListId: null,
                    expenseItems: {
                        create: e.expenseItems
                    }
                }
            });
        }));

        res.status(200).json({ message: "Wydatki z paragonów zapisane pomyślnie." });

    } catch (error) {
        console.error("Błąd webhooka:", error);
        res.status(500).json({ error: "Błąd serwera." });
    }
});

module.exports = router;