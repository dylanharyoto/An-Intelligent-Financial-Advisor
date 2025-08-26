"use client";

import { useState, useEffect } from "react";
import { Line, Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { getStockWebSocketClient, StockData } from "../services/stockWebSocket";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Stock {
  symbol: string;
  price: number;
  quantity: number;
  livePrice?: number;
  percentageChange?: number;
}

const AVAILABLE_SYMBOLS = [
  "0001.HK",
  "0002.HK",
  "0003.HK",
  "0005.HK",
  "0006.HK",
  "0011.HK",
  "0012.HK",
  "0016.HK",
  "0017.HK",
  "0019.HK",
  "0027.HK",
  "0066.HK",
  "0081.HK",
  "0083.HK",
  "0101.HK",
  "0175.HK",
  "0267.HK",
  "0288.HK",
  "0386.HK",
  "0388.HK",
  "0700.HK",
  "0883.HK",
  "0939.HK",
  "0941.HK",
  "0992.HK",
  "1038.HK",
  "1044.HK",
  "1088.HK",
  "1093.HK",
  "1109.HK",
  "1113.HK",
  "1177.HK",
  "1299.HK",
  "1398.HK",
  "1810.HK",
  "1928.HK",
  "1997.HK",
  "2007.HK",
  "2018.HK",
  "2020.HK",
  "2269.HK",
  "2313.HK",
  "2318.HK",
  "2319.HK",
  "2382.HK",
  "2388.HK",
  "2628.HK",
  "3328.HK",
  "3690.HK",
  "3988.HK",
  "6862.HK",
  "9618.HK",
  "9888.HK",
  "9988.HK",
];

const COMPANY_NAMES: { [key: string]: string } = {
  "0001.HK": "CKH Holdings",
  "0002.HK": "CLP Holdings",
  "0003.HK": "Hong Kong and China Gas",
  "0005.HK": "HSBC Holdings",
  "0006.HK": "Power Assets",
  "0700.HK": "Tencent",
  "0883.HK": "CNOOC",
  "0939.HK": "China Construction Bank",
  "0941.HK": "China Mobile",
  "1299.HK": "AIA Group",
  "1398.HK": "Industrial and Commercial Bank of China",
  "2318.HK": "Ping An Insurance",
  "3988.HK": "Bank of China",
  "9988.HK": "Alibaba Group",
};

const defaultStocks: Stock[] = [
  { symbol: "0700.HK", price: 350.0, quantity: 100 },
  { symbol: "0005.HK", price: 65.5, quantity: 200 },
  { symbol: "1299.HK", price: 85.2, quantity: 150 },
];

const mockEfficientFrontierData = {
  datasets: [
    {
      label: "Efficient Frontier",
      data: [
        { x: 10, y: 8 },
        { x: 12, y: 10 },
        { x: 15, y: 12 },
        { x: 18, y: 14 },
        { x: 22, y: 16 },
        { x: 25, y: 17 },
        { x: 30, y: 18 },
      ],
      backgroundColor: "rgba(59, 130, 246, 0.6)",
      borderColor: "rgba(59, 130, 246, 1)",
      pointRadius: 6,
    },
  ],
};

const mockScenarios = ["Base", "Optimistic", "Pessimistic", "Sentiment-Driven"];

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);

  // Once mounted on client, now we can show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  const [stocks, setStocks] = useState<Stock[]>(defaultStocks);
  const [showAddForm, setShowAddForm] = useState(false);
  const [portfolio, setPortfolio] = useState<
    { symbol: string; weight: number }[]
  >([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [riskTolerance, setRiskTolerance] = useState(5); // 1-10 scale
  const [horizon, setHorizon] = useState(5); // years
  const [customHorizonValue, setCustomHorizonValue] = useState<number>(1);
  const [horizonUnit, setHorizonUnit] = useState<string>("yearly");
  const [scenario, setScenario] = useState(mockScenarios[0]);
  const [newStock, setNewStock] = useState<Stock>({
    symbol: "",
    price: 0,
    quantity: 0,
  });
  const [symbolQuery, setSymbolQuery] = useState<string>("");
  const [filteredSymbols, setFilteredSymbols] = useState<string[]>([]);
  const [errors, setErrors] = useState<{
    symbol?: string;
    price?: string;
    quantity?: string;
  }>({});
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(
    null
  );

  // Stock data management
  useEffect(() => {
    const client = getStockWebSocketClient();

    const handleMessage = (data: StockData) => {
      setStocks((prevStocks) =>
        prevStocks.map((stock) => {
          if (stock.symbol === data.symbol) {
            const previousPrice = stock.livePrice || stock.price;
            const currentPrice = data.price;
            const percentageChange =
              ((currentPrice - previousPrice) / previousPrice) * 100;

            return {
              ...stock,
              livePrice: currentPrice,
              percentageChange: percentageChange,
            };
          }
          return stock;
        })
      );
    };

    const handleConnectionChange = (connected: boolean) => {
      setWsConnected(connected);
    };

    client.onMessage(handleMessage);
    client.onConnectionChange(handleConnectionChange);

    // Subscribe to all stocks
    stocks.forEach((stock) => {
      client.subscribe(stock.symbol);
    });

    return () => {
      client.cleanup();
    };
  }, [stocks]);

  const handleAddStock = (symbol: string, weight: number) => {
    setPortfolio((prev) => {
      const existing = prev.find((p) => p.symbol === symbol);
      if (existing) {
        return prev.map((p) => (p.symbol === symbol ? { ...p, weight } : p));
      }
      return [...prev, { symbol, weight }];
    });
  };

  const handleOptimize = () => {
    // Mock optimization logic - in reality, this would call an optimization algorithm
    const totalValue = stocks.reduce(
      (sum, stock) => sum + stock.price * stock.quantity,
      0
    );
    const optimizedWeights = stocks.map((stock) => ({
      symbol: stock.symbol,
      weight: ((stock.price * stock.quantity) / totalValue) * 100,
    }));
    setPortfolio(optimizedWeights);
  };

  // Mock data for charts
  const portfolioPerformanceData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Portfolio Value",
        data: [10000, 11200, 10800, 12500, 13200, 14100],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
    ],
  };

  // Filter symbols based on query
  useEffect(() => {
    const q = symbolQuery.toUpperCase();
    if (!q) setFilteredSymbols(AVAILABLE_SYMBOLS.slice(0, 10));
    else
      setFilteredSymbols(
        AVAILABLE_SYMBOLS.filter((s) => s.includes(q)).slice(0, 10)
      );
  }, [symbolQuery]);

  // Don't render anything until mounted to avoid hydration errors
  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 text-gray-900 p-2 lg:p-3 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">AI</span>
            </div>
            <h1 className="text-base lg:text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Intelligent Financial Advisor
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3 lg:gap-4">
          {/* WebSocket Connection Status */}
          <div
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
              wsConnected
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full animate-pulse ${
                wsConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span className="hidden md:inline">
              {wsConnected ? "Live Data Connected" : "Live Data Disconnected"}
            </span>
            <span className="md:hidden">
              {wsConnected ? "Live" : "Offline"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 relative">
        {/* Left Sidebar: Enhanced Inputs - Always Visible */}
        <aside className="w-full lg:w-96 xl:w-[28rem] p-4 lg:p-6 bg-white/95 backdrop-blur-sm border-r border-gray-200 overflow-y-auto shadow-xl lg:shadow-none">
          {/* Portfolio Stocks Section with Border */}
          <section className="mb-3">
            <div className="p-2 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-xl border border-blue-200/50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 text-blue-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Portfolio Stocks
                </h3>
                <button
                  onClick={() => setShowAddForm((s) => !s)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md ${
                    showAddForm
                      ? "bg-red-50 text-red-600 border border-red-200"
                      : "bg-blue-50 text-blue-600 border border-blue-200"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-3 w-3 transition-transform duration-200 ${
                      showAddForm ? "rotate-45" : ""
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-xs">
                    {showAddForm ? "Cancel" : "Add Stock"}
                  </span>
                </button>
              </div>

              {/* Enhanced Collapsible Add Form */}
              {showAddForm && (
                <div className="p-6 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-2xl border border-blue-200/50 mb-6 transition-all duration-300">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Stock Symbol
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Enter symbol (e.g., 0001.HK)"
                          className="w-full p-3 border border-gray-300 rounded-xl text-gray-900 bg-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          value={symbolQuery || newStock.symbol}
                          onChange={(e) => {
                            setSymbolQuery(e.target.value);
                            setNewStock({
                              ...newStock,
                              symbol: e.target.value.toUpperCase(),
                            });
                          }}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                      {/* Enhanced typeahead list */}
                      {symbolQuery && filteredSymbols.length > 0 && (
                        <div className="border border-gray-200 bg-white rounded-xl mt-1 max-h-40 overflow-y-auto shadow-lg z-10">
                          {filteredSymbols.map((s) => (
                            <div
                              key={s}
                              className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                              onClick={() => {
                                setNewStock({ ...newStock, symbol: s });
                                setSymbolQuery(s);
                                setFilteredSymbols([]);
                              }}
                            >
                              <div className="font-medium text-gray-900">
                                {s}
                              </div>
                              <div className="text-xs text-gray-500">
                                {COMPANY_NAMES[s] || "Unknown Company"}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {errors.symbol && (
                        <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <svg
                            className="h-3 w-3"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {errors.symbol}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Quantity
                        </label>
                        <input
                          type="number"
                          placeholder="Enter quantity"
                          className="w-full p-3 border border-gray-300 rounded-xl text-gray-900 bg-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          value={newStock.quantity || ""}
                          onChange={(e) =>
                            setNewStock({
                              ...newStock,
                              quantity: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                        {errors.quantity && (
                          <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                            <svg
                              className="h-3 w-3"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {errors.quantity}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Price ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Enter price"
                          className="w-full p-3 border border-gray-300 rounded-xl text-gray-900 bg-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          value={newStock.price || ""}
                          onChange={(e) =>
                            setNewStock({
                              ...newStock,
                              price: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                        {errors.price && (
                          <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                            <svg
                              className="h-3 w-3"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {errors.price}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        // validation
                        const e: typeof errors = {};
                        if (!newStock.symbol) e.symbol = "Symbol is required";
                        if (newStock.price <= 0) e.price = "Price must be > 0";
                        if (newStock.quantity <= 0)
                          e.quantity = "Quantity must be > 0";
                        setErrors(e);
                        if (Object.keys(e).length === 0) {
                          setStocks([...stocks, newStock]);
                          setNewStock({
                            symbol: "",
                            price: 0,
                            quantity: 0,
                          });
                          setSymbolQuery("");
                          setShowAddForm(false);
                        }
                      }}
                      className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                    >
                      Add Stock to Portfolio
                    </button>
                  </div>
                </div>
              )}

              {/* Enhanced Scrollable Stock List */}
              <div className="relative">
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300">
                  {stocks.map((stock, index) => (
                    <div
                      key={`${stock.symbol}-${index}`}
                      className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="font-medium text-gray-900">
                                {stock.symbol}
                              </div>
                              <div className="text-xs text-gray-600 truncate">
                                {COMPANY_NAMES[stock.symbol] ??
                                  "Unknown Company"}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Price and Change Section - Right Side */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">
                              $
                              {stock.livePrice
                                ? stock.livePrice.toFixed(2)
                                : stock.price.toFixed(2)}
                            </div>
                            {stock.percentageChange !== undefined && (
                              <div
                                className={`text-xs font-medium ${
                                  stock.percentageChange >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                <span>
                                  {stock.percentageChange >= 0 ? "+" : ""}
                                  {stock.percentageChange.toFixed(2)}%
                                </span>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => setConfirmDeleteIndex(index)}
                            className="p-1 text-red-600 hover:text-red-800"
                            aria-label={`Remove ${stock.symbol}`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                      {/* labels for inputs */}
                      <div className="flex items-center text-xs text-gray-600 mt-2 gap-2">
                        <div className="w-28 text-center">Price</div>
                        <div className="w-20 text-center">Quantity</div>
                        <div className="w-24 text-center">Weight %</div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Price"
                          className="w-28 p-1 border border-gray-300 rounded text-gray-900 bg-white placeholder-gray-500"
                          value={stock.price}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const updated = [...stocks];
                            updated[index] = {
                              ...updated[index],
                              price: val,
                            };
                            setStocks(updated);
                          }}
                        />
                        <input
                          type="number"
                          placeholder="Qty"
                          className="w-20 p-1 border border-gray-300 rounded text-gray-900 bg-white placeholder-gray-500"
                          value={stock.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            const updated = [...stocks];
                            updated[index] = {
                              ...updated[index],
                              quantity: val,
                            };
                            setStocks(updated);
                          }}
                        />
                        <input
                          type="number"
                          placeholder="Weight %"
                          className="w-24 p-1 border border-gray-300 rounded text-gray-900 bg-white placeholder-gray-500"
                          onChange={(e) =>
                            handleAddStock(
                              stock.symbol,
                              parseFloat(e.target.value)
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Delete confirmation modal - centered */}
          {confirmDeleteIndex !== null && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[60]">
              <div className="bg-white p-6 rounded-2xl shadow-2xl w-96 max-w-[90vw] border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Confirm Removal
                </h4>
                <p className="text-sm text-gray-700 mb-6">
                  Are you sure you want to remove{" "}
                  <span className="font-medium text-blue-600">
                    {stocks[confirmDeleteIndex].symbol}
                  </span>{" "}
                  from your portfolio?
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setConfirmDeleteIndex(null)}
                    className="px-4 py-2 border border-gray-300 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const idx = confirmDeleteIndex;
                      if (idx === null) return;
                      const newStocks = [...stocks];
                      const removed = newStocks.splice(idx, 1);
                      setStocks(newStocks);
                      setPortfolio(
                        portfolio.filter((p) => p.symbol !== removed[0].symbol)
                      );
                      setConfirmDeleteIndex(null);
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors duration-200"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Compact Risk Tolerance */}
          <section className="mb-3">
            <div className="p-2 bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-xl border border-purple-200/50">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 text-purple-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Risk Tolerance
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Low</span>
                <div className="flex-1 relative">
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={riskTolerance}
                    onChange={(e) => setRiskTolerance(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                <span className="text-xs text-gray-600">High</span>
                <div className="px-1.5 py-0.5 bg-white rounded-md border text-xs font-medium text-purple-600">
                  {riskTolerance}
                </div>
              </div>
            </div>
          </section>

          {/* Compact Scenario Analysis */}
          <section className="mb-3">
            <div className="p-2 bg-gradient-to-br from-orange-50/50 to-amber-50/50 rounded-xl border border-orange-200/50">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 text-orange-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
                Scenario Analysis
              </h3>
              <select
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              >
                {mockScenarios.map((sc) => (
                  <option key={sc} value={sc}>
                    {sc}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Compact Investment Horizon */}
          <section className="mb-3">
            <div className="p-2 bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-xl border border-green-200/50">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                Investment Horizon
              </h3>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { value: 0.083, label: "1M" },
                    { value: 0.25, label: "3M" },
                    { value: 0.5, label: "6M" },
                    { value: 1, label: "1Y" },
                    { value: 3, label: "3Y" },
                    { value: 5, label: "5Y" },
                    { value: 10, label: "10Y" },
                    { value: 0, label: "Custom" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setHorizon(option.value)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200 border ${
                        horizon === option.value
                          ? "bg-green-500 text-white border-green-500"
                          : "bg-white text-gray-700 border-gray-200 hover:border-green-300"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {horizon === 0 && (
                  <div className="flex gap-1.5 mt-1.5">
                    <input
                      type="number"
                      min={1}
                      value={customHorizonValue}
                      onChange={(e) =>
                        setCustomHorizonValue(parseInt(e.target.value || "1"))
                      }
                      className="flex-1 p-1.5 border border-gray-300 rounded-md text-gray-900 bg-white text-xs focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    />
                    <select
                      value={horizonUnit}
                      onChange={(e) => setHorizonUnit(e.target.value)}
                      className="flex-1 p-1.5 border border-gray-300 rounded-md text-gray-900 bg-white text-xs focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                      <option value="daily">Daily</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Compact Optimize Button */}
          <button
            onClick={handleOptimize}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm">Optimize Portfolio</span>
          </button>
        </aside>

        {/* Right Content: Charts and Analysis */}
        <section className="flex-1 p-3 lg:p-4 space-y-4 overflow-y-auto">
          {/* Enhanced Charts Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Enhanced Efficient Frontier */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
                Efficient Frontier
              </h3>
              <div className="w-full h-64">
                <Scatter
                  data={mockEfficientFrontierData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: "Risk (Std Dev)",
                          color: "#000",
                        },
                        ticks: { color: "#000" },
                        grid: {
                          color: "#e5e7eb",
                        },
                      },
                      y: {
                        title: {
                          display: true,
                          text: "Return (%)",
                          color: "#000",
                        },
                        ticks: { color: "#000" },
                        grid: {
                          color: "#e5e7eb",
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        labels: {
                          color: "#000",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Enhanced Portfolio Performance */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full"></div>
                Portfolio Performance
              </h3>
              <div className="w-full h-64">
                <Line
                  data={portfolioPerformanceData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: "Time",
                          color: "#000",
                        },
                        ticks: { color: "#000" },
                        grid: {
                          color: "#e5e7eb",
                        },
                      },
                      y: {
                        title: {
                          display: true,
                          text: "Value ($)",
                          color: "#000",
                        },
                        ticks: { color: "#000" },
                        grid: {
                          color: "#e5e7eb",
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        labels: {
                          color: "#000",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Enhanced Recommended Portfolio */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-violet-400 to-purple-500 rounded-full"></div>
                Recommended Portfolio
              </h3>
              <div className="space-y-3">
                {portfolio.map(({ symbol, weight }) => (
                  <div
                    key={symbol}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="font-medium text-gray-900">
                        {symbol}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {weight.toFixed(1)}%
                    </span>
                  </div>
                ))}
                {portfolio.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    Click "Optimize Portfolio" to generate recommendations
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
