const express = require("express");
const router = express.Router();

const prisma = require("../db/prisma");
const auth = require("../middleware/auth")

router.get("/", auth, async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            where: { userId: req.user.id },
            orderBy: { name: "asc" },
        });
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Błąd podczas pobierania kategorii." });
    }
});

router.post("/", auth, async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !String(name).trim()) {
            return res.status(400).json({ error: "Nazwa jest wymagana." });
        }

        const category = await prisma.category.create({
            data: {
                name: String(name).trim(),
                userId: req.user.id
            },
        });
        res.status(201).json(category);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Błąd podczas dodawania kategorii." });
    }
});

router.delete("/:id", auth, async (req, res) => {
    try {
        const result = await prisma.category.deleteMany({
            where: {
                id: Number(req.params.id),
                userId: req.user.id
            }
        });
        if (result.count === 0) {
            return res.status(404).json({ error: "Nie znaleziono kategorii lub brak uprawnień." })
        }
        res.status(200).json({
            message: "Kategoria została usunięta.",
            deletedId: Number(req.params.id)
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Błąd podczas usuwania kategorii." })
    }
});


router.put("/:id", auth, async (req, res) => {
    try {
        const { name } = req.body;
        const categoryId = Number(req.params.id);

        const existingCategory = await prisma.category.findFirst({
            where: {
                id: categoryId,
                userId: Number(req.user.id)
            }
        });
        if (!existingCategory) {
            return res.status(404).json({ error: "Nie znaleziono kategorii lub brak uprawnień." });
        }
        const updatedCategory = await prisma.category.update({
            where: {
                id: categoryId
            },
            data: {
                name: name
            }
        });
        res.status(200).json(updatedCategory);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Błąd podczas aktualizacji kategorii." })
    }
});



module.exports = router;