const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);

const fs = require('fs');

async function scrapePromotions() {
    console.log("[INFO] Initializing scraping engine in stealth mode...");
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    try {
        console.log("[INFO] Navigating to target URL...");
        await page.goto(process.env.SCRAPER_TARGET_URL, {
            waitUntil: 'networkidle',
            timeout: 60000
        });

        console.log("[INFO] Handling cookie consent...");
        const cookieButton = page.locator('#onetrust-accept-btn-handler');
        if (await cookieButton.isVisible()) {
            await cookieButton.click();
            await page.waitForTimeout(1000);
        }


        console.log("[INFO] Awaiting initial product render...");
        const productCardSelector = 'div[data-test^="fop-wrapper:"]';
        await page.waitForSelector(productCardSelector, { timeout: 15000 });

        console.log("[INFO] Initiating human-like infinite scroll and data extraction...");

        page.on('console', msg => {
            if (msg.text().includes('[PROGRESS]') || msg.text().includes('[ACTION]')) {
                console.log(msg.text());
            }
        });

        const MAX_PRODUCTS = 100;

        const extractedData = await page.evaluate(async (limit) => {
            const delay = (min, max) => new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));
            const productsMap = new Map();

            let stuckCounter = 0;
            let previousDatasetSize = 0;

            const formatText = (element) => element ? element.innerText.trim().replace(/\u00a0/g, ' ').replace(/\s+/g, ' ') : "";
            const parseCurrency = (text) => text ? (parseFloat(text.replace(/[^\d,]/g, '').replace(',', '.')) || 0) : 0;

            while (productsMap.size < limit) {
                const currentCards = document.querySelectorAll('div[data-test^="fop-wrapper:"]');

                currentCards.forEach(card => {
                    const productId = card.getAttribute('data-test');

                    if (!productsMap.has(productId)) {
                        const titleElement = card.querySelector('[data-test="fop-title"]') || card.querySelector('h3');
                        const productName = titleElement?.innerText.trim();

                        if (productName) {
                            const offerElement = card.querySelector('[data-test="fop-offer-text"]');
                            const unitElement = card.querySelector('[data-test="fop-size"]');
                            const referencePriceElement = card.querySelector('[data-test="fop-reference-price"]');
                            const currentPriceElement = card.querySelector('[data-test="fop-price"]');
                            const depositElement = card.querySelector('[data-test="product-card-deposit-badge"]');

                            const rawReferencePrice = formatText(referencePriceElement);
                            const rawDeposit = depositElement ? formatText(depositElement.querySelector("span")) : "-";

                            productsMap.set(productId, {
                                externalId: productId,
                                name: productName,
                                promoDetails: formatText(offerElement) || "-",
                                priceUnit: formatText(unitElement) || "-",
                                oldPrice: rawReferencePrice || "-",
                                promoPrice: parseCurrency(currentPriceElement?.innerText),
                                depositPrice: rawDeposit,
                                scrapedAt: new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })
                            });
                        }
                    }
                });

                console.log(`[PROGRESS] Extracted unique records: ${productsMap.size} / ${limit}`);

                if (productsMap.size >= limit) {
                    console.log(`[ACTION] Target limit of ${limit} reached. Terminating...`);
                    break;
                }

                if (productsMap.size === previousDatasetSize) {
                    stuckCounter++;
                    if (stuckCounter >= 10) {
                        console.log("[ACTION] End of DOM reached before hitting the limit.");
                        break;
                    }

                    window.scrollBy(0, -250);
                    await delay(600, 1200);
                    window.scrollBy(0, 500);
                } else {
                    stuckCounter = 0;
                    previousDatasetSize = productsMap.size;
                }

                window.scrollBy(0, Math.floor(Math.random() * 400) + 300);
                await delay(1500, 3000);

                if (Math.random() < 0.15) {
                    console.log("[ACTION] Simulating human reading pause (Macro delay)...");
                    await delay(6000, 11000);
                    window.scrollBy(0, Math.random() > 0.5 ? 150 : -150);
                    await delay(500, 1200);
                }
            }

            return Array.from(productsMap.values()).slice(0, limit);

        }, MAX_PRODUCTS);

        console.log("\n[INFO] Data extraction complete. Previewing sample:");
        console.table(extractedData.slice(0, 10));

        const outputPath = 'promocje.json';
        fs.writeFileSync(outputPath, JSON.stringify(extractedData, null, 2));
        console.log(`\n[SUCCESS] Wrote ${extractedData.length} records to ${outputPath}`);

    } catch (error) {
        console.error("[ERROR] Execution failed:", error);
    } finally {
        await browser.close();
        console.log("[INFO] Browser instance terminated. Process finished.");
    }
}

scrapePromotions();