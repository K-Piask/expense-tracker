const express = require("express");
const prisma = require("../db/prisma");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            where: { userId: 1 }, //tymczasowo
            orderBy: { name: "asc" },
        });
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Błąd pobierania kategorii" });
    }
});

router.post("/", async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !String(name).trim()) {
            return res.status(400).json({ error: "name jest wymagane" });
        }

        const category = await prisma.category.create({
            data: {
                name: String(name).trim(),
                userId: 1, //tymczasowo
            },
        });
        res.status(201).json(category);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Błąd dodawania kategorii" });
    }
});

module.exports = router;