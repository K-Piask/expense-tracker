const express = require("express");
const router = express.Router();

const prisma = require("../db/prisma");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
    try {
        const shoppingList = await prisma.shoppingList.findMany({
            where: {
                userId: req.user.id,
                isDone: false,
            },
            include: { shoppingListItems: true }
        });
        res.json(shoppingList);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Błąd podczas pobierania list zakupów." });
    }
});

router.post("/", auth, async (req, res) => {
    try {
        const { name, shoppingListItems = [] } = req.body;
        const shoppingList = await prisma.shoppingList.create({
            data: {
                name: String(name).trim(),
                userId: req.user.id,
                shoppingListItems: {
                    create: shoppingListItems
                }
            }
        });
        res.status(201).json(shoppingList);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Błąd podczas dodawania listy zakupów." });
    }
});

router.delete("/:id", auth, async (req, res) => {
    try {
        const result = await prisma.shoppingList.deleteMany({
            where: {
                id: Number(req.params.id),
                userId: req.user.id
            }
        });
        if (result.count === 0) {
            return res.status(404).json({ error: "Nie znaleziono listy zakupów lub brak uprawnień." })
        }

        res.status(200).json({
            message: "Lista zakupów została usunięta.",
            deletedId: Number(req.params.id)
        })

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Błąd podczas usuwania listy zakupów." })
    }
});

router.put("/:id", auth, async (req, res) => {
    try {
        const { name, isDone, shoppingListItems = [] } = req.body;
        const listId = Number(req.params.id);

        const existingList = await prisma.shoppingList.findFirst({
            where: {
                id: listId,
                userId: Number(req.user.id)
            }
        });

        if (!existingList) {
            return res.status(404).json({ error: "Nie znaleziono listy zakupów lub brak uprawnień." })
        }

        const itemsToCreate = shoppingListItems.filter(item => item.id == null);
        const itemsToUpdate = shoppingListItems.filter(item => item.id != null);
        const incomingIds = itemsToUpdate.map(item => item.id);

        const updatedList = await prisma.shoppingList.update({
            where: {
                id: listId
            },
            data: {
                name: name,
                isDone: isDone,
                shoppingListItems: {
                    deleteMany: {
                        id: {
                            notIn: incomingIds
                        }
                    },
                    update: itemsToUpdate.map(item => ({
                        where: {
                            id: item.id
                        },
                        data: {
                            name: item.name
                        }
                    })),
                    create: itemsToCreate.map(item => ({
                        name: item.name
                    }))
                }
            },
            include: { shoppingListItems: true }
        });
        res.status(200).json(updatedList);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Błąd podczas aktualizacji listy zakupów." })
    }
});

module.exports = router;