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
            orderBy: {
                id: 'asc'
            },
            include: { shoppingListItems: true }
        });
        res.json(shoppingList);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Błąd podczas pobierania list zakupów." });
    }
});

router.get("/:id", auth, async (req, res) => {
    try {
        const shoppingList = await prisma.shoppingList.findFirst({
            where: {
                id: Number(req.params.id),
                userId: req.user.id,
                isDone: false,
            },
            include: {
                shoppingListItems: {
                    orderBy: {
                        id: 'asc'
                    }
                }
            }
        });
        res.json(shoppingList);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Błąd podczas pobierania listy zakupów." });
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

router.post("/:id/items", auth, async (req, res) => {
    try {
        const { name } = req.body;
        const listId = Number(req.params.id);

        const list = await prisma.shoppingList.findFirst({
            where: {
                id: listId,
                userId: req.user.id,
            },
        });
        if (!list) {
            return res.status(404).json({ error: "Nie znaleziono listy lub brak uprawnień." });
        }

        const shoppingListItem = await prisma.shoppingListItem.create({
            data: {
                name: String(name).trim(),
                shoppingListId: listId
            }

        });

        res.status(201).json(shoppingListItem);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Błąd podczas dodawania produktu." });
    }
});

router.patch("/:id", auth, async (req, res) => {
    try {
        const { name } = req.body;


        const updatedList = await prisma.shoppingList.update({
            where: {
                id: Number(req.params.id),
                userId: req.user.id,
            },
            data: {
                name: String(name).trim()
            }
        });


        res.status(200).json(updatedList);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Błąd podczas edycji listy." });
    }
});

router.patch("/:id/items/:itemId", auth, async (req, res) => {
    try {
        const { isBought, promotionId } = req.body;
        const listId = Number(req.params.id);
        const listItemId = Number(req.params.itemId);

        const list = await prisma.shoppingList.findFirst({
            where: {
                id: listId,
                userId: req.user.id,
            },
        });
        if (!list) {
            return res.status(404).json({ error: "Nie znaleziono listy lub brak uprawnień." });
        }

        const result = await prisma.shoppingListItem.updateMany({
            where: {
                id: listItemId,
                shoppingListId: listId
            },
            data: {
                ...(isBought !== undefined && { isBought: Boolean(isBought) }),
                ...(promotionId !== undefined && { promotionId: promotionId === null ? null : String(promotionId) })
            }
        });

        if (result.count === 0) {
            return res.status(404).json({ error: "Nie znaleziono produktu na tej liście." })
        }

        res.status(200).json({
            message: "Status produktu zaktualizowany.",
            isBought: Boolean(isBought)
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Błąd podczas oznaczania produktu listy." });
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
            return res.status(404).json({ error: "Nie znaleziono listy lub brak uprawnień." })
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

router.delete("/:id/items/:itemId", auth, async (req, res) => {
    try {
        const listId = Number(req.params.id);
        const listItemId = Number(req.params.itemId);

        const list = await prisma.shoppingList.findFirst({
            where: {
                id: listId,
                userId: req.user.id
            }
        });
        if (!list) {
            return res.status(404).json({ error: "Nie znaleziono listy lub brak uprawnień." })
        }

        const result = await prisma.shoppingListItem.deleteMany({
            where: {
                id: listItemId,
                shoppingListId: listId
            }
        });

        if (result.count === 0) {
            return res.status(404).json({ error: "Nie znaleziono produktu na tej liście." });
        }

        res.status(200).json({
            message: "Produkt został usunięty.",
            deletedId: listItemId
        })

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Błąd podczas usuwania produktu." })
    }
});

{/*NIEUŻYTY*/ }
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