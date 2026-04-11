const prisma = require("../src/db/prisma");

const fs = require('fs');
const path = require('path');

async function runImport() {
    console.log(`[INFO] Initializing the database connection...`);
    const syncStartTime = new Date();
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
        }
        const deleteResult = await prisma.promotion.deleteMany({
            where: {
                updatedAt: {
                    lt: syncStartTime
                }
            }
        })
        console.log(`[CLEANUP] ${deleteResult.count} outdated promotions removed.`);
        console.log(`[SUCCESS] Database updated! All ${promotions.length} promotions are on place.`);
    } catch (error) {
        console.error("[ERROR] Something went wrong during import:", error);
    } finally {
        await prisma.$disconnect();
    }
}

runImport();