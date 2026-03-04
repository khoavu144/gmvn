import { chromium } from 'playwright';

async function scanDomain(baseUrl: string) {
    console.log(`Starting scan on: ${baseUrl}`);
    const browser = await chromium.launch({ headless: true });
    
    const consoleErrors: {url: string, msg: string}[] = [];
    const failedRequests: {page: string, url: string, status: number}[] = [];
    const visited = new Set<string>();

    const pagesToVisit = [
        baseUrl,
        `${baseUrl}/coaches`,
        `${baseUrl}/gyms`,
        `${baseUrl}/login`,
        `${baseUrl}/register`,
        `${baseUrl}/about`,
        `${baseUrl}/faq`
    ];

    const context = await browser.newContext();
    const page = await context.newPage();

    page.on('console', msg => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
            consoleErrors.push({ url: page.url(), msg: msg.text() });
        }
    });

    page.on('response', response => {
        if (response.status() >= 400 && response.url().includes('api')) {
            failedRequests.push({ page: page.url(), url: response.url(), status: response.status() });
        }
    });

    for (const url of pagesToVisit) {
        if (visited.has(url)) continue;
        console.log(`Visiting: ${url}`);
        try {
            await page.goto(url, { waitUntil: 'load', timeout: 15000 });
            visited.add(url);
            await page.waitForTimeout(2000);
        } catch (e: any) {
             consoleErrors.push({ url, msg: `Navigation Failed: ${e.message}` });
        }
    }

    await browser.close();

    console.log('\n--- SCAN RESULTS ---');
    console.log('\nFailed Network Requests (4xx, 5xx):');
    failedRequests.forEach(r => console.log(`[${r.status}] on ${r.page} -> ${r.url}`));
    
    console.log('\nConsole Errors & Warnings:');
    consoleErrors.forEach(e => console.log(`[${e.url}] ${e.msg}`));
}

scanDomain('https://gymerviet.com').catch(console.error);
