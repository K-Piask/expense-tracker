const express = require("express");
const router = express.Router();

const prisma = require("../db/prisma");

router.get("/", async (req, res) => {
    try {
        const shoppingList = await prisma.shoppingList.findMany({
            where: {
                userId: 1,
                isDone: false,
            },
            include: { shoppingListItems: true }
        });
        res.json(shoppingList);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error loading shopping lists" });
    }
});

router.post("/", async (req, res) => {
    try {
        const { name, shoppingListItems } = req.body;
        const shoppingList = await prisma.shoppingList.create({
            data: {
                name: String(name).trim(),
                userId: 1,
                shoppingListItems: {
                    create: shoppingListItems
                }
            }
        });
        res.status(201).json(shoppingList);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error inserting shopping list" });
    }
})


module.exports = router;