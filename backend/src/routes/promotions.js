const express = require("express");
const router = express.Router();
const prisma = require("../db/prisma");
const { GoogleGenerativeAI } = require('@google/generative-ai');

const { semanticCategories, calculateCosineDistance } = require('../utils/categoryMapper');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

let categoryEmbeddings = [];

async function initCategoryVectors() {
    console.log("[SYSTEM] Starting semantic category vector generation...");
    try {
        for (const cat of semanticCategories) {
            const textToEmbed = `Kategoria: ${cat.name}. Zawiera: ${cat.desc}`;
            const result = await aiModel.embedContent(textToEmbed);

            categoryEmbeddings.push({
                ...cat,
                vector: result.embedding.values
            });
        }
        console.log(`[SYSTEM] Successfully loaded ${categoryEmbeddings.length} category vectors into RAM.`);
    } catch (error) {
        console.error("[SYSTEM ERROR] Failed to initialize category vectors:", error);
    }
}

initCategoryVectors();

router.get('/search', async (req, res) => {
    const searchQuery = req.query.q;

    if (!searchQuery) {
        console.warn("[SEARCH] Request rejected: Missing 'q' parameter.");
        return res.status(400).json({ error: "Brak parametru wyszukiwania 'q'." });
    }

    try {
        console.log(`[SEARCH] Processing query : ${searchQuery}`);

        const contextualQuery = `Produkt w supermarkecie: ${searchQuery}`;
        const aiResult = await aiModel.embedContent(contextualQuery);
        const vectorArray = aiResult.embedding.values;
        const vectorString = `[${vectorArray.join(",")}]`;

        console.log(`[SEARCH] Query vector generated. Fetching closest products from database...`);

        const results = await prisma.$queryRaw`
            SELECT 
                id, "externalId", name, "promoDetails", "priceUnit", "oldPrice", "promoPrice", "depositPrice",
                (embedding <=> ${vectorString}::vector) AS distance,
                embedding::text AS product_vector
            FROM "Promotion"
            WHERE (embedding <=> ${vectorString}::vector) < 0.33
            ORDER BY embedding <=> ${vectorString}::vector
            LIMIT 10;
        `;
        console.log(`[SEARCH] Found ${results.length} products. Assigning categories dynamically...`);

        // 3. Wzbogacamy wyniki o kategorie
        const enrichedResults = results.map(promo => {
            // Parsujemy string z bazy (np. "[0.12, -0.04...]") na prawdziwą tablicę JavaScript
            const productVectorData = JSON.parse(promo.product_vector);

            let bestCategory = null;
            let minDistance = Infinity;

            // Szukamy kategorii, której wektor jest najbliżej wektora produktu
            for (const cat of categoryEmbeddings) {
                const dist = calculateCosineDistance(productVectorData, cat.vector);

                if (dist < minDistance) {
                    minDistance = dist;
                    bestCategory = cat;
                }
            }

            // Wyciągamy product_vector, żeby nie wysyłać tysięcy niepotrzebnych liczb na frontend
            const { product_vector, ...productDataToSend } = promo;

            return {
                ...productDataToSend,
                categoryName: bestCategory ? bestCategory.name : "Inne",
                imagePath: bestCategory ? bestCategory.image : "/images/cat_other.png",
                // Zostawiam ten parametr zakomentowany, ale jest przydatny do debugowania precyzji:
                // categoryMatchScore: minDistance 
            };
        });

        console.log("[SEARCH] Process completed successfully. Sending response to client.");
        res.json(enrichedResults);

    } catch (error) {
        console.error("[ERROR] Critical failure during semantic search execution:", error);
        res.status(500).json({ error: "Wewnętrzny błąd serwera." });
    }
});

module.exports = router;