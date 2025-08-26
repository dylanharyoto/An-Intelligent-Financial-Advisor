import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Store active WebSocket connections
const clients = new Set();

// Store current stock data
const stockData = new Map();

// Yahoo Finance API endpoints (using public endpoints)
const YAHOO_FINANCE_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart/';

// Function to fetch stock data from Yahoo Finance
async function fetchStockData(symbol) {
  try {
    const response = await fetch(`${YAHOO_FINANCE_BASE}${symbol}`);
    const data = await response.json();
    
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error(`No data found for symbol: ${symbol}`);
    }

    const result = data.chart.result[0];
    const meta = result.meta;
    const quote = result.indicators.quote[0];
    
    // Get the latest price and previous close
    const currentPrice = meta.regularMarketPrice || quote.close[quote.close.length - 1];
    const previousClose = meta.previousClose;
    
    // Calculate percentage change
    const priceChange = currentPrice - previousClose;
    const percentageChange = ((priceChange / previousClose) * 100);

    return {
      symbol: symbol,
      price: currentPrice,
      previousClose: previousClose,
      priceChange: priceChange,
      percentageChange: percentageChange,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error.message);
    return null;
  }
}

// Function to broadcast data to all connected clients
function broadcastToClients(data) {
  const message = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  });
}

// Function to fetch and update stock data
async function updateStockData(symbols) {
  for (const symbol of symbols) {
    const data = await fetchStockData(symbol);
    if (data) {
      stockData.set(symbol, data);
      
      // Broadcast the update to all clients
      broadcastToClients({
        type: 'STOCK_UPDATE',
        data: data
      });
    }
  }
}

// HTTP Server
const server = app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

// WebSocket Server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('New WebSocket connection established');
  clients.add(ws);

  // Send current stock data to new client
  stockData.forEach(data => {
    ws.send(JSON.stringify({
      type: 'STOCK_UPDATE',
      data: data
    }));
  });

  ws.on('message', async (message) => {
    try {
      const parsedMessage = JSON.parse(message.toString());
      
      if (parsedMessage.type === 'SUBSCRIBE') {
        const { symbols } = parsedMessage;
        console.log(`Client subscribing to symbols: ${symbols.join(', ')}`);
        
        // Immediately fetch data for requested symbols
        await updateStockData(symbols);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// REST API endpoints
app.get('/api/stock/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const data = await fetchStockData(symbol);
  
  if (data) {
    res.json(data);
  } else {
    res.status(404).json({ error: 'Stock data not found' });
  }
});

app.get('/api/stocks', (req, res) => {
  const symbols = req.query.symbols ? req.query.symbols.split(',') : [];
  const result = symbols.map(symbol => stockData.get(symbol)).filter(Boolean);
  res.json(result);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Periodic updates (every 30 seconds for live data simulation)
// In production, you might want to use a more sophisticated approach
setInterval(async () => {
  if (stockData.size > 0) {
    const symbols = Array.from(stockData.keys());
    await updateStockData(symbols);
  }
}, 30000); // Update every 30 seconds

console.log('Stock streaming service started');
console.log('WebSocket server listening for connections');
