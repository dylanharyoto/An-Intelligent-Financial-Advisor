# Backend Service for Financial Advisor

This backend service provides real-time stock price streaming using Yahoo Finance data.

## Features

- Real-time stock price updates via WebSocket
- Yahoo Finance integration
- RESTful API endpoints
- Event-driven architecture (publisher-subscriber pattern)
- CORS enabled for frontend integration

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. The server will run on http://localhost:3001

## API Endpoints

### WebSocket

- `ws://localhost:3001` - Real-time stock updates

### REST API

- `GET /api/stock/:symbol` - Get single stock data
- `GET /api/stocks?symbols=AAPL,GOOGL` - Get multiple stocks data
- `GET /health` - Health check

## WebSocket Messages

### Subscribe to symbols

```json
{
  "type": "SUBSCRIBE",
  "symbols": ["0001.HK", "0002.HK", "0003.HK"]
}
```

### Stock update (received)

```json
{
  "type": "STOCK_UPDATE",
  "data": {
    "symbol": "0001.HK",
    "price": 50.25,
    "previousClose": 49.8,
    "priceChange": 0.45,
    "percentageChange": 0.9,
    "timestamp": "2025-08-26T10:30:00.000Z"
  }
}
```
