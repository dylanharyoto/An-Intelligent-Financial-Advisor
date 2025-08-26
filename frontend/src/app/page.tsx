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
import { useTheme } from "next-themes";

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
}

const defaultStocks: Stock[] = [
  { symbol: "0001.HK", price: 50.2, quantity: 0 },
  { symbol: "0002.HK", price: 65.3, quantity: 0 },
  { symbol: "0003.HK", price: 7.1, quantity: 0 },
];

const COMPANY_NAMES: Record<string, string> = {
  "0001.HK": "CK Hutchison",
  "0002.HK": "CLP Holdings",
  "0003.HK": "Hong Kong and China Gas",
  "0004.HK": "WH Group",
  "0388.HK": "Kingfisher",
  "0700.HK": "Tencent",
};

// Small sample list for the typeahead dropdown — extend as needed
const AVAILABLE_SYMBOLS = [
  "0001.HK",
  "0002.HK",
  "0003.HK",
  "0004.HK",
  "0388.HK",
  "0700.HK",
  "0005.HK",
  "0011.HK",
  "3988.HK",
  "1299.HK",
];

const mockEfficientFrontierData = {
  labels: [
    "Portfolio 1",
    "Portfolio 2",
    "Portfolio 3",
    "Portfolio 4",
    "Portfolio 5",
  ],
  datasets: [
    {
      label: "Efficient Frontier",
      data: [
        { x: 5, y: 8 },
        { x: 7, y: 10 },
        { x: 10, y: 12 },
        { x: 12, y: 13 },
        { x: 15, y: 14 },
      ],
      borderColor: "rgb(75, 192, 192)",
      backgroundColor: "rgba(75, 192, 192, 0.5)",
    },
  ],
};

const mockGrowthData = {
  labels: ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"],
  datasets: [
    {
      label: "Projected Growth",
      data: [100, 110, 125, 140, 160],
      borderColor: "rgb(53, 162, 235)",
      backgroundColor: "rgba(53, 162, 235, 0.5)",
    },
  ],
};

const mockScenarios = ["Base", "Optimistic", "Pessimistic", "Sentiment-Driven"];

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Once mounted on client, now we can show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  const [stocks, setStocks] = useState<Stock[]>(defaultStocks);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [portfolio, setPortfolio] = useState<
    { symbol: string; weight: number }[]
  >([]);
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
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(
    null
  );
  const [symbolQuery, setSymbolQuery] = useState("");
  const [filteredSymbols, setFilteredSymbols] =
    useState<string[]>(AVAILABLE_SYMBOLS);
  const [errors, setErrors] = useState<{
    symbol?: string;
    price?: string;
    quantity?: string;
  }>({});

  const handleAddStock = (symbol: string, weight: number) => {
    setPortfolio([...portfolio, { symbol, weight }]);
  };

  const handleOptimize = () => {
    // Mock optimization - in production, call backend API
    console.log("Optimizing portfolio:", {
      portfolio,
      riskTolerance,
      horizon,

      scenario,
    });
    // Update charts with real data from backend
  };

  // persist stocks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("stocks", JSON.stringify(stocks));
    } catch (e) {
      /* ignore */
    }
  }, [stocks]);

  // simple typeahead filtering for available symbols
  useEffect(() => {
    const q = (symbolQuery || "").trim().toUpperCase();
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
    <div className="flex flex-col h-full w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Intelligent AI-Powered Financial Advisor
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "🌞" : "🌙"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Inputs */}
        {showSidebar && (
          <aside className="relative w-full md:w-1/3 lg:w-1/4 p-4 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            {/* small circular collapse toggle positioned on the panel's right edge */}
            <button
              onClick={() => setShowSidebar(false)}
              title="Collapse panel"
              aria-label="Collapse panel"
              className="absolute right-0 top-6 transform translate-x-1/2 -translate-y-0 z-40 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 shadow"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-900 dark:text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Portfolio Stocks */}
            <section className="mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Portfolio Stocks
                </h3>
                <button
                  onClick={() => setShowAddForm((s) => !s)}
                  className="text-sm px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  {showAddForm ? "Hide" : "Add New"}
                </button>
              </div>

              {/* Collapsible Add Form */}
              {showAddForm && (
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700 mt-2 transition-all duration-200 ease-out">
                  <div className="space-y-2">
                    <div>
                      <input
                        type="text"
                        placeholder="Symbol (type or pick)"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
                        value={symbolQuery || newStock.symbol}
                        onChange={(e) => {
                          setSymbolQuery(e.target.value);
                          setNewStock({
                            ...newStock,
                            symbol: e.target.value.toUpperCase(),
                          });
                        }}
                      />
                      {/* typeahead list */}
                      {symbolQuery && filteredSymbols.length > 0 && (
                        <div className="border border-gray-200 bg-white rounded mt-1 max-h-40 overflow-y-auto">
                          {filteredSymbols.map((s) => (
                            <div
                              key={s}
                              className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-sm"
                              onClick={() => {
                                setNewStock({ ...newStock, symbol: s });
                                setSymbolQuery(s);
                                setFilteredSymbols([]);
                              }}
                            >
                              {s}
                            </div>
                          ))}
                        </div>
                      )}
                      {errors.symbol && (
                        <div className="text-xs text-red-600 mt-1">
                          {errors.symbol}
                        </div>
                      )}
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Quantity"
                        className="w-full p-2 border border-gray-300 rounded text-gray-900 placeholder-gray-500"
                        value={newStock.quantity || ""}
                        onChange={(e) =>
                          setNewStock({
                            ...newStock,
                            quantity: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                      {errors.quantity && (
                        <div className="text-xs text-red-600 mt-1">
                          {errors.quantity}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Price"
                        className="flex-1 p-2 border border-gray-300 rounded"
                        value={newStock.price || ""}
                        onChange={(e) =>
                          setNewStock({
                            ...newStock,
                            price: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                      {errors.price && (
                        <div className="text-xs text-red-600 mt-1">
                          {errors.price}
                        </div>
                      )}
                      <button
                        onClick={() => {
                          // validation
                          const e: typeof errors = {};
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
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Scrollable Stock List */}
              <div className="overflow-y-auto max-h-64 mt-2 space-y-2 pr-2">
                {stocks.map((stock, index) => (
                  <div
                    key={`${stock.symbol}-${index}`}
                    className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {stock.symbol}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {COMPANY_NAMES[stock.symbol] ?? "Unknown Company"}
                        </div>
                      </div>
                      <button
                        onClick={() => setConfirmDeleteIndex(index)}
                        className="p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        aria-label={`Remove ${stock.symbol}`}
                      >
                        {/* simple X icon */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
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
                      {/* labels for inputs */}
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-2 gap-4">
                        <div className="w-28">Price</div>
                        <div className="w-20">Quantity</div>
                        <div className="w-24">Weight</div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Price"
                          className="w-28 p-1 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
                          value={stock.price}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const updated = [...stocks];
                            updated[index] = { ...updated[index], price: val };
                            setStocks(updated);
                          }}
                        />
                        <input
                          type="number"
                          placeholder="Qty"
                          className="w-20 p-1 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
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
                          className="w-24 p-1 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
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
            </section>

            {/* Delete confirmation modal (simple inline) */}
            {confirmDeleteIndex !== null && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-md w-96">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Confirm removal
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    Are you sure you want to remove{" "}
                    {stocks[confirmDeleteIndex].symbol}?
                  </p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setConfirmDeleteIndex(null)}
                      className="px-3 py-1 border rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
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
                          portfolio.filter(
                            (p) => p.symbol !== removed[0].symbol
                          )
                        );
                        setConfirmDeleteIndex(null);
                      }}
                      className="px-3 py-1 bg-red-600 text-white rounded"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Risk Tolerance */}
            <section className="mb-6">
              <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
                Risk Tolerance
              </h3>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={riskTolerance}
                  onChange={(e) => setRiskTolerance(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg accent-black dark:accent-white"
                />
                <div className="w-8 text-center">{riskTolerance}</div>
              </div>
            </section>

            {/* Investment Horizon */}
            <section className="mb-6">
              <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
                Investment Horizon
              </h3>
              <div className="flex gap-2 flex-wrap mb-2">
                {[1, 3, 5, 10].map((y) => (
                  <button
                    key={y}
                    onClick={() => setHorizon(y)}
                    className={`px-3 py-1 rounded ${
                      horizon === y
                        ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    } hover:bg-gray-200 dark:hover:bg-gray-600`}
                  >
                    {y}y
                  </button>
                ))}
                <button
                  onClick={() => setHorizon(0)}
                  className={`px-3 py-1 rounded ${
                    horizon === 0
                      ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  } hover:bg-gray-200 dark:hover:bg-gray-600`}
                >
                  Custom
                </button>
              </div>
              {horizon === 0 && (
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    value={customHorizonValue}
                    onChange={(e) =>
                      setCustomHorizonValue(parseInt(e.target.value || "1"))
                    }
                    className="w-2/3 p-2 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                  />
                  <select
                    value={horizonUnit}
                    onChange={(e) => setHorizonUnit(e.target.value)}
                    className="w-1/3 p-2 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="daily">Daily</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              )}
            </section>

            {/* Assumptions removed (NLP not integrated) */}

            {/* Scenario Toggles */}
            <section className="mb-6">
              <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
                Scenario
              </h3>
              <select
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              >
                {mockScenarios.map((sc) => (
                  <option key={sc} value={sc} className="dark:bg-gray-700">
                    {sc}
                  </option>
                ))}
              </select>
            </section>

            {/* Optimize Button */}
            <button
              onClick={handleOptimize}
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 p-2 rounded hover:bg-gray-800 dark:hover:bg-gray-100"
            >
              Optimize Portfolio
            </button>
          </aside>
        )}

        {/* persistent collapsed toggle (shown when sidebar hidden) */}
        {!showSidebar && (
          <button
            onClick={() => setShowSidebar(true)}
            aria-label="Open panel"
            title="Open panel"
            className="fixed left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 z-50 p-2 rounded-full bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-lg border border-gray-700 dark:border-gray-300"
            style={{ width: 36, height: 36 }}
          >
            {/* small chevron pointing right */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}

        {/* Right: Visualizations */}
        <section className="flex-1 p-4 overflow-y-auto bg-white dark:bg-gray-800">
          {/* visual area header removed per UX request */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Efficient Frontier */}
            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
                Efficient Frontier
              </h3>
              <div className="w-full h-[40vh]">
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
                          color: theme === "dark" ? "#fff" : "#000",
                        },
                        ticks: { color: theme === "dark" ? "#fff" : "#000" },
                        grid: {
                          color: theme === "dark" ? "#374151" : "#e5e7eb",
                        },
                      },
                      y: {
                        title: {
                          display: true,
                          text: "Return (%)",
                          color: theme === "dark" ? "#fff" : "#000",
                        },
                        ticks: { color: theme === "dark" ? "#fff" : "#000" },
                        grid: {
                          color: theme === "dark" ? "#374151" : "#e5e7eb",
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        labels: {
                          color: theme === "dark" ? "#fff" : "#000",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Projected Portfolio Growth */}
            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
                Projected Portfolio Growth
              </h3>
              <div className="w-full h-[40vh]">
                <Line
                  data={mockGrowthData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: "Time",
                          color: theme === "dark" ? "#fff" : "#000",
                        },
                        ticks: { color: theme === "dark" ? "#fff" : "#000" },
                        grid: {
                          color: theme === "dark" ? "#374151" : "#e5e7eb",
                        },
                      },
                      y: {
                        title: {
                          display: true,
                          text: "Value ($)",
                          color: theme === "dark" ? "#fff" : "#000",
                        },
                        ticks: { color: theme === "dark" ? "#fff" : "#000" },
                        grid: {
                          color: theme === "dark" ? "#374151" : "#e5e7eb",
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        labels: {
                          color: theme === "dark" ? "#fff" : "#000",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Recommended Portfolio */}
            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
                Recommended Portfolio
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This section will display the recommended portfolio based on the
                analysis.
              </p>
            </div>

            {/* Risk-Return Trade-offs */}
            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm lg:col-span-1">
              <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
                Risk-Return Trade-offs
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Additional visualizations or metrics can be added here (e.g.,
                Sharpe Ratio, etc.).
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
