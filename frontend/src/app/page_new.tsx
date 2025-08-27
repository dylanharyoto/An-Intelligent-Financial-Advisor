"use client";

import { useState, useEffect, useRef } from "react";
import { Line, Scatter, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
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
  BarElement,
  ArcElement,
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

const COMPANY_NAMES: { [key: string]: string } = {
  "0001.HK": "CKH Holdings",
  "0002.HK": "CLP Holdings",
  "0003.HK": "HK & China Gas",
  "0005.HK": "HSBC Holdings",
  "0006.HK": "Power Assets",
  "0011.HK": "Hang Seng Bank",
  "0012.HK": "Henderson Land",
  "0016.HK": "Sun Hung Kai Prop",
  "0017.HK": "New World Dev",
  "0019.HK": "Swire Pacific A",
  "0023.HK": "Bank of East Asia",
  "0027.HK": "Galaxy Entertainment",
  "0066.HK": "MTR Corporation",
  "0083.HK": "Sino Land",
  "0101.HK": "Hang Lung PPT",
  "0135.HK": "Kunlun Energy",
  "0144.HK": "China Mer Port",
  "0151.HK": "Want Want China",
  "0175.HK": "Geely Auto",
  "0241.HK": "Ali Health",
  "0267.HK": "CITIC",
  "0268.HK": "Kingdee Intl",
  "0285.HK": "BYD Company",
  "0288.HK": "WH Group",
  "0386.HK": "Sinopec Corp",
  "0388.HK": "HKEx",
  "0669.HK": "Techtronic Ind",
  "0700.HK": "Tencent",
  "0788.HK": "China Tower",
  "0823.HK": "Link REIT",
  "0857.HK": "PetroChina",
  "0883.HK": "CNOOC",
  "0939.HK": "CCB",
  "0941.HK": "China Mobile",
  "0968.HK": "Xinyi Solar",
  "0981.HK": "SMIC",
  "0992.HK": "Lenovo Group",
  "1038.HK": "CKI Holdings",
  "1044.HK": "Hengan Intl",
  "1093.HK": "CSPC Pharma",
  "1109.HK": "China Resource Land",
  "1113.HK": "CK Asset",
  "1171.HK": "Yankuang Energy",
  "1177.HK": "Sino Biopharm",
  "1211.HK": "BYD Company",
  "1299.HK": "AIA",
  "1398.HK": "ICBC",
  "1810.HK": "Xiaomi Corp",
  "1918.HK": "Sunac",
  "1972.HK": "Swire Properties",
  "1997.HK": "Wharf REIC",
  "2007.HK": "Country Garden",
  "2018.HK": "AAC Technologies",
  "2020.HK": "ANTA Sports",
  "2269.HK": "Wuxi Bio",
  "2313.HK": "Shenzhou Intl",
  "2318.HK": "Ping An",
  "2319.HK": "Mengniu Dairy",
  "2382.HK": "Sunny Optical",
  "2388.HK": "BOC Hong Kong",
  "2518.HK": "AutoNavi",
  "2628.HK": "China Life",
  "3328.HK": "Bankcomm",
  "3690.HK": "Meituan",
  "3888.HK": "Kingsoft",
  "3968.HK": "CM Bank",
  "3988.HK": "Bank of China",
  "6098.HK": "Country Garden Svc",
  "6862.HK": "Haidilao Intl",
  "9618.HK": "JD.com",
  "9888.HK": "Bidu",
  "9988.HK": "Alibaba",
  "9999.HK": "NetEase",
};

export default function Home() {
  // State variables
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [newStock, setNewStock] = useState<Stock>({
    symbol: "",
    price: 0,
    quantity: 0,
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [symbolQuery, setSymbolQuery] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [riskTolerance, setRiskTolerance] = useState(5);
  const [horizon, setHorizon] = useState(1);
  const [customHorizonValue, setCustomHorizonValue] = useState(1);
  const [horizonUnit, setHorizonUnit] = useState("yearly");
  const [scenario, setScenario] = useState("Normal Market");
  const [wsConnected, setWsConnected] = useState(false);
  const wsClient = useRef<any>(null);

  const mockScenarios = [
    "Normal Market",
    "Bull Market",
    "Bear Market",
    "High Volatility",
    "Economic Recession",
    "Tech Bubble",
    "Interest Rate Rise",
  ];

  // Mock data for AI Financial Dashboard
  const mockPerformanceData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Portfolio Performance",
        data: [100, 103, 98, 107, 112, 115],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.1,
      },
    ],
  };

  const mockAllocationData = {
    labels: ["Stocks", "Bonds", "Cash"],
    datasets: [
      {
        data: [65, 25, 10],
        backgroundColor: ["#3B82F6", "#10B981", "#8B5CF6"],
        borderColor: ["#1D4ED8", "#059669", "#7C3AED"],
        borderWidth: 2,
      },
    ],
  };

  const mockSectorData = {
    labels: ["Tech", "Finance", "Healthcare", "Energy", "Consumer"],
    datasets: [
      {
        data: [25, 20, 15, 12, 18],
        backgroundColor: [
          "#3B82F6",
          "#10B981",
          "#F59E0B",
          "#EF4444",
          "#8B5CF6",
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "white",
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: "white",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      y: {
        ticks: {
          color: "white",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
  };

  // Generate efficient frontier for optimization
  const efficientFrontier = generateEfficientFrontier();

  function generateEfficientFrontier() {
    const points = [];
    for (let i = 0; i < 50; i++) {
      const risk = 0.05 + (i / 50) * 0.2;
      const expectedReturn =
        0.02 + Math.sqrt(risk) * 0.4 + Math.random() * 0.02;
      points.push({ x: risk, y: expectedReturn });
    }
    return points.sort((a, b) => a.x - b.x);
  }

  useEffect(() => {
    // Initialize WebSocket connection
    wsClient.current = getStockWebSocketClient();

    wsClient.current.connect();

    wsClient.current.onMessage((data: StockData) => {
      setStocks((prevStocks) =>
        prevStocks.map((stock) =>
          stock.symbol === data.symbol
            ? {
                ...stock,
                livePrice: data.price,
                percentageChange: data.percentageChange,
              }
            : stock
        )
      );
    });

    wsClient.current.onConnectionChange((connected: boolean) => {
      setWsConnected(connected);
    });

    return () => {
      if (wsClient.current) {
        wsClient.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    // Subscribe to stock symbols when stocks change
    if (wsClient.current && stocks.length > 0) {
      const symbols = stocks.map((stock) => stock.symbol);
      wsClient.current.subscribeToStocks(symbols);
    }
  }, [stocks]);

  const handleOptimize = async () => {
    if (stocks.length === 0) {
      alert("Please add some stocks to your portfolio first.");
      return;
    }

    setIsOptimizing(true);

    // Simulate optimization process
    setTimeout(() => {
      const optimizedPortfolio = stocks.map((stock, index) => ({
        ...stock,
        optimizedWeight: Math.random() * 0.4 + 0.1,
        expectedReturn: Math.random() * 0.15 + 0.05,
        risk: Math.random() * 0.2 + 0.1,
      }));

      setPortfolio(optimizedPortfolio);
      setIsOptimizing(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 text-white p-3 flex items-center justify-between shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">AI</span>
            </div>
            <h1 className="text-lg font-bold text-white">
              Intelligent Financial Advisor
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-300">AI Active</span>
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
              wsConnected
                ? "bg-green-900/40 text-green-400 border border-green-700"
                : "bg-red-900/40 text-red-400 border border-red-700"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full animate-pulse ${
                wsConnected ? "bg-green-400" : "bg-red-400"
              }`}
            ></div>
            <span>{wsConnected ? "Live" : "Disconnected"}</span>
          </div>
          <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
            Export Report
          </button>
        </div>
      </header>

      <main className="flex flex-1 relative">
        {/* Left Sidebar: Input Controls */}
        <aside className="w-80 px-4 py-4 bg-gray-800 border-r border-gray-700 overflow-y-auto shadow-xl">
          {/* Portfolio Stocks Section */}
          <section className="mb-4">
            <div className="px-3 py-3 bg-gray-900 rounded-xl border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 text-blue-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Portfolio Stocks
                </h3>
                <button
                  onClick={() => setShowAddForm((s) => !s)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-gray-700 text-gray-300 border border-gray-600 hover:border-gray-500 transition-all duration-200"
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

              <div className="relative">
                <div className="space-y-1 max-h-64 overflow-y-auto pr-2">
                  {showAddForm && (
                    <div className="px-2 py-2 bg-gray-800 rounded-lg border border-gray-600 mb-2">
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-gray-300">
                            Stock Symbol
                          </label>
                          <input
                            type="text"
                            placeholder="Enter symbol (e.g., 0001.HK)"
                            className="w-full p-2 border border-gray-600 rounded-lg text-sm text-white bg-gray-700 placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            value={symbolQuery || newStock.symbol}
                            onChange={(e) => {
                              setSymbolQuery(e.target.value);
                              setNewStock({
                                ...newStock,
                                symbol: e.target.value.toUpperCase(),
                              });
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-gray-300">
                              Quantity
                            </label>
                            <input
                              type="number"
                              placeholder="Qty"
                              className="w-full p-2 border border-gray-600 rounded-lg text-sm text-white bg-gray-700 placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              value={newStock.quantity || ""}
                              onChange={(e) =>
                                setNewStock({
                                  ...newStock,
                                  quantity: parseInt(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-gray-300">
                              Price ($)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="Price"
                              className="w-full p-2 border border-gray-600 rounded-lg text-sm text-white bg-gray-700 placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              value={newStock.price || ""}
                              onChange={(e) =>
                                setNewStock({
                                  ...newStock,
                                  price: parseFloat(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const e: any = {};
                            if (!newStock.symbol)
                              e.symbol = "Symbol is required";
                            if (newStock.price <= 0)
                              e.price = "Price must be > 0";
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
                          className="w-full mt-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200"
                        >
                          Add Stock
                        </button>
                      </div>
                    </div>
                  )}

                  {stocks.map((stock, index) => (
                    <div
                      key={`${stock.symbol}-${index}`}
                      className="bg-gray-700 border border-gray-600 rounded-lg p-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-white text-sm">
                            {stock.symbol}
                          </div>
                          <div className="text-xs text-gray-300">
                            {COMPANY_NAMES[stock.symbol] ?? "Unknown"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-white">
                            $
                            {stock.livePrice?.toFixed(2) ||
                              stock.price.toFixed(2)}
                          </div>
                          <div
                            className={`text-xs ${
                              stock.percentageChange &&
                              stock.percentageChange >= 0
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {stock.percentageChange?.toFixed(2) || "0.00"}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Risk Tolerance */}
          <section className="mb-4">
            <div className="px-3 py-3 bg-gray-900 rounded-xl border border-gray-700">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                <svg
                  className="h-3 w-3 text-purple-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
                Risk Tolerance
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-300">Low</span>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={riskTolerance}
                  onChange={(e) => setRiskTolerance(parseInt(e.target.value))}
                  className="flex-1 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs text-gray-300">High</span>
                <div className="px-2 py-1 bg-gray-700 rounded-md text-xs font-medium text-white min-w-[2rem] text-center">
                  {riskTolerance}
                </div>
              </div>
            </div>
          </section>

          {/* Scenario Analysis */}
          <section className="mb-4">
            <div className="px-3 py-3 bg-gray-900 rounded-xl border border-gray-700">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                <svg
                  className="h-3 w-3 text-orange-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
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
                className="w-full p-2 border border-gray-600 rounded-lg text-sm text-white bg-gray-700 focus:ring-1 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              >
                {mockScenarios.map((sc) => (
                  <option key={sc} value={sc}>
                    {sc}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Investment Horizon */}
          <section className="mb-4">
            <div className="px-3 py-3 bg-gray-900 rounded-xl border border-gray-700">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                <svg
                  className="h-3 w-3 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                Investment Horizon
              </h3>
              <div className="relative">
                <div className="min-h-[5rem] max-h-[5rem] overflow-y-auto">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
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
                          className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 border ${
                            horizon === option.value
                              ? "bg-green-600 text-white border-green-600"
                              : "bg-gray-700 text-gray-300 border-gray-600 hover:border-green-400"
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
                            setCustomHorizonValue(
                              parseInt(e.target.value || "1")
                            )
                          }
                          className="flex-1 p-1.5 border border-gray-600 rounded-md text-white bg-gray-700 text-xs focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        />
                        <select
                          value={horizonUnit}
                          onChange={(e) => setHorizonUnit(e.target.value)}
                          className="flex-1 p-1.5 border border-gray-600 rounded-md text-white bg-gray-700 text-xs focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
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
              </div>
            </div>
          </section>

          <button
            onClick={handleOptimize}
            className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm">Optimize Portfolio</span>
          </button>
        </aside>

        {/* Main Content Area - AI Financial Dashboard */}
        <div className="flex-1 p-6 bg-gray-900 overflow-auto">
          {/* Dashboard Grid Layout */}
          <div className="grid grid-cols-12 gap-6 h-full">
            {/* Top Row - Key Metrics */}
            <div className="col-span-12 grid grid-cols-4 gap-4 mb-6">
              {/* Portfolio Value */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">
                      Portfolio Value
                    </h3>
                    <p className="text-2xl font-bold text-white">
                      $
                      {stocks
                        .reduce(
                          (acc, stock) =>
                            acc +
                            (stock.livePrice || stock.price) * stock.quantity,
                          0
                        )
                        .toLocaleString()}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-green-400">+2.4%</span>
                  <span className="text-sm text-gray-400"> today</span>
                </div>
              </div>

              {/* Total Return */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">
                      Total Return
                    </h3>
                    <p className="text-2xl font-bold text-white">12.8%</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-blue-400">YTD</span>
                </div>
              </div>

              {/* Risk Score */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">
                      AI Risk Score
                    </h3>
                    <p className="text-2xl font-bold text-white">
                      {riskTolerance}/10
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-orange-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-orange-400">Moderate</span>
                </div>
              </div>

              {/* AI Confidence */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">
                      AI Confidence
                    </h3>
                    <p className="text-2xl font-bold text-white">94%</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-purple-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-purple-400">High</span>
                </div>
              </div>
            </div>

            {/* Main Charts Row */}
            <div className="col-span-8 grid grid-rows-2 gap-6">
              {/* Portfolio Performance Chart */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Portfolio Performance
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-400">Real-time</span>
                  </div>
                </div>
                <div className="h-48">
                  <Line data={mockPerformanceData} options={chartOptions} />
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  AI Recommendations
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-700/50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Increase Tech Allocation
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Based on current market trends, consider increasing
                        technology sector exposure by 5-8%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-700/50 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Rebalance Portfolio
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Your portfolio has drifted from target allocation.
                        Consider rebalancing.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-700/50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Diversification Opportunity
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Adding emerging market exposure could improve
                        risk-adjusted returns
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Analytics */}
            <div className="col-span-4 grid grid-rows-3 gap-6">
              {/* Asset Allocation */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Asset Allocation
                </h3>
                <div className="h-32">
                  <Doughnut
                    data={mockAllocationData}
                    options={{
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                    }}
                  />
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span className="text-gray-300">Stocks</span>
                    </div>
                    <span className="text-white">65%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span className="text-gray-300">Bonds</span>
                    </div>
                    <span className="text-white">25%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded"></div>
                      <span className="text-gray-300">Cash</span>
                    </div>
                    <span className="text-white">10%</span>
                  </div>
                </div>
              </div>

              {/* Risk Analytics */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Risk Analytics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Volatility</span>
                    <span className="text-sm text-white">12.4%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Sharpe Ratio</span>
                    <span className="text-sm text-white">1.23</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Max Drawdown</span>
                    <span className="text-sm text-white">-8.7%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Beta</span>
                    <span className="text-sm text-white">0.92</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-xs text-green-400">
                      Portfolio risk is within target range
                    </span>
                  </div>
                </div>
              </div>

              {/* Market Sentiment */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  AI Market Sentiment
                </h3>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-green-400">
                    Bullish
                  </div>
                  <div className="text-sm text-gray-400">Market Outlook</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Fear & Greed Index</span>
                    <span className="text-green-400">72</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">VIX Level</span>
                    <span className="text-white">18.4</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">AI Confidence</span>
                    <span className="text-blue-400">High</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row - Detailed Analytics */}
            <div className="col-span-12 grid grid-cols-2 gap-6">
              {/* Efficient Frontier */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Efficient Frontier Analysis
                </h3>
                <div className="h-64">
                  {portfolio.length > 0 && (
                    <Scatter
                      data={{
                        datasets: [
                          {
                            label: "Efficient Frontier",
                            data: efficientFrontier,
                            backgroundColor: "rgba(59, 130, 246, 0.5)",
                            borderColor: "rgb(59, 130, 246)",
                            pointRadius: 3,
                          },
                          {
                            label: "Current Portfolio",
                            data: [
                              {
                                x: Math.sqrt(0.04),
                                y: 0.12,
                              },
                            ],
                            backgroundColor: "rgba(239, 68, 68, 0.8)",
                            borderColor: "rgb(239, 68, 68)",
                            pointRadius: 8,
                          },
                        ],
                      }}
                      options={{
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            labels: { color: "white" },
                          },
                        },
                        scales: {
                          x: {
                            title: {
                              display: true,
                              text: "Risk (Volatility)",
                              color: "white",
                            },
                            ticks: { color: "white" },
                            grid: { color: "rgba(255, 255, 255, 0.1)" },
                          },
                          y: {
                            title: {
                              display: true,
                              text: "Return (%)",
                              color: "white",
                            },
                            ticks: { color: "white" },
                            grid: { color: "rgba(255, 255, 255, 0.1)" },
                          },
                        },
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Sector Exposure */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Sector Exposure
                </h3>
                <div className="h-64">
                  <Bar
                    data={mockSectorData}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                      },
                      scales: {
                        x: {
                          ticks: { color: "white" },
                          grid: { display: false },
                        },
                        y: {
                          ticks: { color: "white" },
                          grid: { color: "rgba(255, 255, 255, 0.1)" },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
