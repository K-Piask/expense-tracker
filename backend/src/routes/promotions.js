const express = require("express");
const router = express.Router();
const prisma = require("../db/prisma");
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });


router.get('/search', async (req, res) => {
    const searchQuery = req.query.q;

    if (!searchQuery) {
        return res.status(400).json({ error: "Missing search parameter 'q'" });
    }

    try {
        console.log(`[SEARCH] Asking AI for the semantic meaning of: ${searchQuery}`);

        const aiResult = await aiModel.embedContent(searchQuery);
        const vectorArray = aiResult.embedding.values;
        const vectorString = `[${vectorArray.join(",")}]`;

        console.log(`[SEARCH] Searching for the mathematically closest products in the database...`);

        const results = await prisma.$queryRaw`
            SELECT 
                id, "externalId", name, "promoDetails", "priceUnit", "oldPrice", "promoPrice",
                (embedding <=> ${vectorString}::vector) AS distance
            FROM "Promotion"
            WHERE (embedding <=> ${vectorString}::vector) < 0.4
            ORDER BY embedding <=> ${vectorString}::vector
            LIMIT 10;
        `;

        res.json(results);

    } catch (error) {
        console.error("[ERROR] Error during smart search execution:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;