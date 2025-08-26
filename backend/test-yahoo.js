// Test script to verify Yahoo Finance API integration
import fetch from "node-fetch";

const YAHOO_FINANCE_BASE = "https://query1.finance.yahoo.com/v8/finance/chart/";

async function testYahooFinanceAPI() {
  const testSymbols = ["0001.HK", "0002.HK", "0003.HK", "AAPL", "GOOGL"];

  console.log("Testing Yahoo Finance API integration...\n");

  for (const symbol of testSymbols) {
    try {
      console.log(`Fetching data for ${symbol}...`);
      const response = await fetch(`${YAHOO_FINANCE_BASE}${symbol}`);
      const data = await response.json();

      if (data.chart && data.chart.result && data.chart.result.length > 0) {
        const result = data.chart.result[0];
        const meta = result.meta;

        console.log(`✅ ${symbol}:`);
        console.log(`   Current Price: $${meta.regularMarketPrice}`);
        console.log(`   Previous Close: $${meta.previousClose}`);
        console.log(`   Currency: ${meta.currency}`);
        console.log(`   Market State: ${meta.marketState}`);
        console.log("");
      } else {
        console.log(`❌ ${symbol}: No data available`);
        console.log("");
      }
    } catch (error) {
      console.log(`❌ ${symbol}: Error - ${error.message}`);
      console.log("");
    }
  }
}

testYahooFinanceAPI();
