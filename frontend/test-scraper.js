#!/usr/bin/env node

/**
 * Test script to verify Puppeteer scraper works
 * Usage: node test-scraper.js <address>
 * Example: node test-scraper.js 0x0fe1ee9b555dcafc
 */

import { scrapeFlowscanAccount } from './api/scraper.js';

const address = process.argv[2] || '0x0fe1ee9b555dcafc';

console.log(`🔍 Testing Flowscan scraper for address: ${address}`);
console.log('⏳ This may take 30-60 seconds...\n');

scrapeFlowscanAccount(address).then(result => {
  console.log('✅ Scraper result:');
  console.log(JSON.stringify(result, null, 2));
  
  if (result.success) {
    console.log(`\n✨ Success! Found:`);
    console.log(`  • ${result.transactions?.length || 0} transactions`);
    console.log(`  • ${result.tokens?.length || 0} tokens`);
    console.log(`  • ${result.collections?.length || 0} collections`);
  } else {
    console.log(`\n❌ Scraper failed: ${result.error}`);
  }
  
  process.exit(result.success ? 0 : 1);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
