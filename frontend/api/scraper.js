import puppeteer from 'puppeteer';

// Scrape Flowscan account page data using Puppeteer
export async function scrapeFlowscanAccount(address) {
  let browser;
  try {
    console.log(`[Scraper] Starting to scrape account: ${address}`);
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    const url = `https://testnet.flowscan.io/account/${address}`;
    
    console.log(`[Scraper] Navigating to ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Extract account summary (balance, staking, delegated, storage)
    const summary = await page.evaluate(() => {
      const extractText = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.innerText.trim() : null;
      };
      
      return {
        primary: extractText('[data-testid="primary-balance"]') || extractText('text-right:nth-child(2)'),
        staked: extractText('[data-testid="staked-balance"]'),
        delegated: extractText('[data-testid="delegated-balance"]'),
        total: extractText('[data-testid="total-balance"]'),
        storageUsed: extractText('[data-testid="storage-used"]'),
        storageCapacity: extractText('[data-testid="storage-capacity"]'),
      };
    });
    
    console.log(`[Scraper] Account summary:`, summary);
    
    // Extract transactions table
    const transactions = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      return rows.map(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        const links = Array.from(row.querySelectorAll('a'));
        return {
          id: cells[0]?.innerText?.trim() || '',
          timestamp: cells[1]?.innerText?.trim() || '',
          type: cells[2]?.innerText?.trim() || '',
          status: cells[3]?.innerText?.trim() || '',
          hash: cells[4]?.innerText?.trim() || '',
          links: links.map(a => ({ text: a.innerText.trim(), href: a.href }))
        };
      }).filter(t => t.id);
    });
    
    console.log(`[Scraper] Found ${transactions.length} transactions`);
    
    // Navigate to Tokens tab
    await page.click('a[href*="tab=tokens"]').catch(() => {
      console.log('[Scraper] Tokens tab not found, skipping');
    });
    await new Promise(r => setTimeout(r, 2000));
    
    const tokens = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      return rows.map(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        return {
          name: cells[0]?.innerText?.trim() || '',
          balance: cells[1]?.innerText?.trim() || '',
          contractAddress: cells[2]?.innerText?.trim() || ''
        };
      }).filter(t => t.name);
    });
    
    console.log(`[Scraper] Found ${tokens.length} tokens`);
    
    // Navigate to Collections tab
    await page.click('a[href*="tab=collections"]').catch(() => {
      console.log('[Scraper] Collections tab not found, skipping');
    });
    await new Promise(r => setTimeout(r, 2000));
    
    const collections = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      return rows.map(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        return {
          name: cells[0]?.innerText?.trim() || '',
          count: cells[1]?.innerText?.trim() || '',
          address: cells[2]?.innerText?.trim() || ''
        };
      }).filter(c => c.name);
    });
    
    console.log(`[Scraper] Found ${collections.length} collections`);
    
    const result = {
      address,
      scrapedAt: new Date().toISOString(),
      summary,
      transactions,
      tokens,
      collections,
      success: true
    };
    
    return result;
  } catch (error) {
    console.error(`[Scraper] Error scraping account ${address}:`, error.message);
    return {
      address,
      scrapedAt: new Date().toISOString(),
      success: false,
      error: error.message
    };
  } finally {
    if (browser) await browser.close();
  }
}

// Export for use in server or as standalone
export default scrapeFlowscanAccount;
