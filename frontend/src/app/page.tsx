"use client";

import { useState } from "react";
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
  const [stocks, setStocks] = useState<Stock[]>(defaultStocks);
  const [portfolio, setPortfolio] = useState<
    { symbol: string; weight: number }[]
  >([]);
  const [riskTolerance, setRiskTolerance] = useState(5); // 1-10 scale
  const [horizon, setHorizon] = useState(5); // years
  const [assumptions, setAssumptions] = useState("");
  const [scenario, setScenario] = useState(mockScenarios[0]);
  const [newStock, setNewStock] = useState<Stock>({
    symbol: "",
    price: 0,
    quantity: 0,
  });
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(
    null
  );

  const handleAddStock = (symbol: string, weight: number) => {
    setPortfolio([...portfolio, { symbol, weight }]);
  };

  const handleOptimize = () => {
    // Mock optimization - in production, call backend API
    console.log("Optimizing portfolio:", {
      portfolio,
      riskTolerance,
      horizon,
      assumptions,
      scenario,
    });
    // Update charts with real data from backend
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-100">
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 text-center">
        <h1 className="text-2xl font-bold">
          Intelligent AI-Powered Financial Advisor
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Inputs */}
        <aside className="w-1/4 p-4 bg-white border-r border-gray-200 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            User Inputs
          </h2>

          {/* Portfolio Stocks */}
          <section className="mb-6">
            <h3 className="text-lg font-medium mb-2">Portfolio Stocks</h3>
            <div className="space-y-4">
              {/* Add New Stock Form */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                <h4 className="text-sm font-semibold mb-2 text-gray-900">
                  Add New Stock
                </h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Symbol (e.g., 0001.HK)"
                    className="w-full p-2 border border-gray-300 rounded text-gray-900 placeholder-gray-500"
                    value={newStock.symbol}
                    onChange={(e) =>
                      setNewStock({ ...newStock, symbol: e.target.value })
                    }
                  />
                  {/* Name not required. Collect quantity instead. */}
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
                    <button
                      onClick={() => {
                        if (newStock.symbol) {
                          setStocks([...stocks, newStock]);
                          setNewStock({ symbol: "", price: 0, quantity: 0 });
                        }
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Stock List */}
              <div className="space-y-2">
                {stocks.map((stock, index) => (
                  <div
                    key={stock.symbol}
                    className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {stock.symbol}
                      </div>
                      <div className="text-sm text-gray-700">
                        Price: ${stock.price.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-700">
                        Quantity: {stock.quantity}
                      </div>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      className="w-28 p-1 border border-gray-300 rounded text-gray-900 placeholder-gray-500"
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
                      className="w-20 p-1 border border-gray-300 rounded text-gray-900 placeholder-gray-500"
                      value={stock.quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        const updated = [...stocks];
                        updated[index] = { ...updated[index], quantity: val };
                        setStocks(updated);
                      }}
                    />
                    <button
                      onClick={() => setConfirmDeleteIndex(index)}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H3a1 1 0 000 2h14a1 1 0 000-2h-2V3a1 1 0 00-1-1H6zm2 6a1 1 0 10-2 0v7a1 1 0 102 0V8zm6 0a1 1 0 10-2 0v7a1 1 0 102 0V8z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Delete confirmation modal (simple inline) */}
          {confirmDeleteIndex !== null && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white p-4 rounded shadow-md w-96">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Confirm removal
                </h4>
                <p className="text-sm text-gray-700 mb-4">
                  Are you sure you want to remove{" "}
                  {stocks[confirmDeleteIndex].symbol}?
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setConfirmDeleteIndex(null)}
                    className="px-3 py-1 border rounded bg-gray-100 text-gray-900"
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
            <h3 className="text-lg font-medium mb-2 text-gray-900">
              Risk Tolerance (1-10)
            </h3>
            <input
              type="range"
              min={1}
              max={10}
              value={riskTolerance}
              onChange={(e) => setRiskTolerance(parseInt(e.target.value))}
              className="w-full accent-blue-600"
            />
            <p className="text-center text-gray-900 font-medium mt-1">
              {riskTolerance}
            </p>
          </section>

          {/* Investment Horizon */}
          <section className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-gray-900">
              Investment Horizon (Years)
            </h3>
            <input
              type="number"
              value={horizon}
              onChange={(e) => setHorizon(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded text-gray-900"
            />
          </section>

          {/* Assumptions */}
          <section className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-gray-900">
              Assumptions
            </h3>
            <textarea
              value={assumptions}
              onChange={(e) => setAssumptions(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-gray-900 placeholder-gray-500"
              rows={4}
            />
          </section>

          {/* Scenario Toggles */}
          <section className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-gray-900">Scenario</h3>
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-gray-900 bg-white"
            >
              {mockScenarios.map((sc) => (
                <option key={sc} value={sc}>
                  {sc}
                </option>
              ))}
            </select>
          </section>

          {/* Optimize Button */}
          <button
            onClick={handleOptimize}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Optimize Portfolio
          </button>
        </aside>

        {/* Right: Visualizations */}
        <section className="flex-1 p-4 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Visualizations</h2>

          {/* Efficient Frontier */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-2">Efficient Frontier</h3>
            <div className="h-64">
              <Scatter
                data={mockEfficientFrontierData}
                options={{
                  scales: {
                    x: { title: { display: true, text: "Risk (Std Dev)" } },
                    y: { title: { display: true, text: "Return (%)" } },
                  },
                }}
              />
            </div>
          </div>

          {/* Projected Portfolio Growth */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-2">
              Projected Portfolio Growth
            </h3>
            <div className="h-64">
              <Line
                data={mockGrowthData}
                options={{
                  scales: {
                    x: { title: { display: true, text: "Time" } },
                    y: { title: { display: true, text: "Value ($)" } },
                  },
                }}
              />
            </div>
          </div>

          {/* Risk-Return Trade-offs (Placeholder) */}
          <div>
            <h3 className="text-lg font-medium mb-2">Risk-Return Trade-offs</h3>
            <p className="text-gray-600">
              Additional visualizations or metrics can be added here (e.g.,
              Sharpe Ratio, etc.).
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
