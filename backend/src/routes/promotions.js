const express = require("express");
const router = express.Router();
const prisma = require("../db/prisma");
const { GoogleGenerativeAI } = require('@google/generative-ai');

const { semanticCategories, calculateCosineDistance } = require('../utils/categoryMapper');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

let categoryEmbeddings = [];

async function initCategoryVectors() {
    // Jeśli kategorie są już w RAM, nie pobierajmy ich drugi raz
    if (categoryEmbeddings.length > 0) return;

    console.log("[SYSTEM] Starting semantic category vector generation (Parallel)...");
    try {
        // Używamy Promise.all, żeby wysłać wszystkie zapytania do Gemini JEDNOCZEŚNIE.
        // Zamiast czekać 15 sekund, wykonamy całość w 1-2 sekundy!
        const promises = semanticCategories.map(async (cat) => {
            const textToEmbed = `Kategoria: ${cat.name}. Zawiera: ${cat.desc}`;
            const result = await aiModel.embedContent(textToEmbed);
            return {
                ...cat,
                vector: result.embedding.values
            };
        });

        // Czekamy, aż wszystkie obietnice (promises) się zakończą
        categoryEmbeddings = await Promise.all(promises);

        console.log(`[SYSTEM] Successfully loaded ${categoryEmbeddings.length} category vectors into RAM.`);
    } catch (error) {
        console.error("[SYSTEM ERROR] Failed to initialize category vectors:", error);
        throw new Error("Nie udało się wygenerować wektorów kategorii.");
    }
}

// UWAGA: USUNĄŁEM TUTAJ GLOBALNE WYWOŁANIE initCategoryVectors(); !!!

router.get('/search', async (req, res) => {
    const searchQuery = req.query.q;

    if (!searchQuery) {
        console.warn("[SEARCH] Request rejected: Missing 'q' parameter.");
        return res.status(400).json({ error: "Brak parametru wyszukiwania 'q'." });
    }

    try {
        // 1. ZAPEWNIAMY, ŻE KATEGORIE SĄ ZAŁADOWANE (Odpali się tylko raz przy pierwszym wyszukiwaniu)
        await initCategoryVectors();

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

        // Reszta Twojego wspaniałego kodu pozostaje bez zmian
        const enrichedResults = results.map(promo => {
            const productVectorData = JSON.parse(promo.product_vector);
            let bestCategory = null;
            let minDistance = Infinity;

            for (const cat of categoryEmbeddings) {
                const dist = calculateCosineDistance(productVectorData, cat.vector);
                if (dist < minDistance) {
                    minDistance = dist;
                    bestCategory = cat;
                }
            }

            const { product_vector, ...productDataToSend } = promo;

            return {
                ...productDataToSend,
                categoryName: bestCategory ? bestCategory.name : "Inne",
                imagePath: bestCategory ? bestCategory.image : "/images/cat_other.png",
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