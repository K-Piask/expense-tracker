const prisma = require("../src/db/prisma");
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function runImport() {
    console.log(`[INFO] Initializing the database connection and AI Model...`);
    const syncStartTime = new Date();
    const aiModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    try {

        const filePath = path.join(__dirname, '..', '..', 'scraper', 'promocje.json');
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const promotions = JSON.parse(fileContent);
        console.log(`[INFO] Ready to import: ${promotions.length} products.`);

        for (const item of promotions) {
            await prisma.promotion.upsert({
                where: {
                    externalId: item.externalId
                },
                update: {
                    promoDetails: item.promoDetails,
                    priceUnit: item.priceUnit,
                    oldPrice: item.oldPrice,
                    promoPrice: item.promoPrice,
                    scrapedAt: item.scrapedAt,
                },
                create: {
                    externalId: item.externalId,
                    name: item.name,
                    promoDetails: item.promoDetails,
                    priceUnit: item.priceUnit,
                    oldPrice: item.oldPrice,
                    promoPrice: item.promoPrice,
                    depositPrice: item.depositPrice,
                    scrapedAt: item.scrapedAt,
                }
            });
            try {
                const aiResult = await aiModel.embedContent(item.name);
                const vectorArray = aiResult.embedding.values;

                const vectorString = `[${vectorArray.join(',')}]`;

                await prisma.$executeRaw`
                    UPDATE "Promotion"
                    SET embedding = ${vectorString}::vector
                    WHERE "externalId" = ${item.externalId}
                `;

                console.log(`[AI] Embedding generated and saved for: ${item.name}`);
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (aiError) {
                console.log(`[AI ERROR] Could not generate embedding for ${item.name}: `, aiError.message);
            }
        }
        const deleteResult = await prisma.promotion.deleteMany({
            where: {
                updatedAt: {
                    lt: syncStartTime
                }
            }
        })
        console.log(`[CLEANUP] ${deleteResult.count} outdated promotions removed.`);
        console.log(`[SUCCESS] Database updated! All ${promotions.length} promotions are on place and vectorized.`);
    } catch (error) {
        console.error("[ERROR] Something went wrong during import process:", error);
    } finally {
        await prisma.$disconnect();
        console.log("[INFO] Database disconnected.")
    }
}

runImport();