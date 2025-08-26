// WebSocket client for real-time stock data
export interface StockData {
  symbol: string;
  price: number;
  previousClose: number;
  priceChange: number;
  percentageChange: number;
  timestamp: string;
}

export interface StockUpdateMessage {
  type: "STOCK_UPDATE";
  data: StockData;
}

class StockWebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectInterval: number = 5000;
  private reconnectTimeoutId: NodeJS.Timeout | null = null;
  private subscribers: Map<string, (data: StockData) => void> = new Map();
  private subscribedSymbols: Set<string> = new Set();
  private maxReconnectAttempts: number = 5;
  private reconnectAttempts: number = 0;

  constructor(private url: string = "ws://localhost:3001") {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log("WebSocket connected to stock service");
          this.reconnectAttempts = 0;

          // Resubscribe to symbols if reconnecting
          if (this.subscribedSymbols.size > 0) {
            this.subscribeToSymbols(Array.from(this.subscribedSymbols));
          }

          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: StockUpdateMessage = JSON.parse(event.data);

            if (message.type === "STOCK_UPDATE") {
              this.handleStockUpdate(message.data);
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        this.ws.onclose = () => {
          console.log("WebSocket connection closed");
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleStockUpdate(data: StockData): void {
    const callback = this.subscribers.get(data.symbol);
    if (callback) {
      callback(data);
    }

    // Also call the global callback if exists
    const globalCallback = this.subscribers.get("*");
    if (globalCallback) {
      globalCallback(data);
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    this.reconnectTimeoutId = setTimeout(() => {
      this.connect().catch((error) => {
        console.error("Reconnection failed:", error);
      });
    }, this.reconnectInterval);
  }

  subscribeToSymbols(symbols: string[]): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        type: "SUBSCRIBE",
        symbols: symbols,
      };

      this.ws.send(JSON.stringify(message));
      symbols.forEach((symbol) => this.subscribedSymbols.add(symbol));
    }
  }

  subscribe(symbol: string, callback: (data: StockData) => void): () => void {
    this.subscribers.set(symbol, callback);

    // If we're connected, subscribe to this symbol
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.subscribeToSymbols([symbol]);
    }

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(symbol);
      this.subscribedSymbols.delete(symbol);
    };
  }

  subscribeToAll(callback: (data: StockData) => void): () => void {
    this.subscribers.set("*", callback);

    return () => {
      this.subscribers.delete("*");
    };
  }

  disconnect(): void {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.subscribers.clear();
    this.subscribedSymbols.clear();
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
let stockWebSocketClient: StockWebSocketClient | null = null;

export function getStockWebSocketClient(): StockWebSocketClient {
  if (!stockWebSocketClient) {
    stockWebSocketClient = new StockWebSocketClient();
  }
  return stockWebSocketClient;
}

export default StockWebSocketClient;
