'use client';

import { useState } from 'react';
import { Line, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

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

// Mock data for HSI stocks (replace with API calls in production)
const mockStocks = [
  { symbol: '0001.HK', name: 'CK Hutchison', price: 50.2 },
  { symbol: '0002.HK', name: 'CLP Holdings', price: 65.3 },
  { symbol: '0003.HK', name: 'Hong Kong and China Gas', price: 7.1 },
  // Add more mock HSI constituents as needed
];

const mockEfficientFrontierData = {
  labels: ['Portfolio 1', 'Portfolio 2', 'Portfolio 3', 'Portfolio 4', 'Portfolio 5'],
  datasets: [
    {
      label: 'Efficient Frontier',
      data: [
        { x: 5, y: 8 },
        { x: 7, y: 10 },
        { x: 10, y: 12 },
        { x: 12, y: 13 },
        { x: 15, y: 14 },
      ],
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
    },
  ],
};

const mockGrowthData = {
  labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
  datasets: [
    {
      label: 'Projected Growth',
      data: [100, 110, 125, 140, 160],
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    },
  ],
};

const mockScenarios = ['Base', 'Optimistic', 'Pessimistic', 'Sentiment-Driven'];

export default function Dashboard() {
  const [portfolio, setPortfolio] = useState<{ symbol: string; weight: number }[]>([]);
  const [riskTolerance, setRiskTolerance] = useState(5); // 1-10 scale
  const [horizon, setHorizon] = useState(5); // years
  const [assumptions, setAssumptions] = useState('');
  const [scenario, setScenario] = useState(mockScenarios[0]);

  const handleAddStock = (symbol: string, weight: number) => {
    setPortfolio([...portfolio, { symbol, weight }]);
  };

  const handleOptimize = () => {
    // Mock optimization - in production, call backend API
    console.log('Optimizing portfolio:', { portfolio, riskTolerance, horizon, assumptions, scenario });
    // Update charts with real data from backend
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 text-center">
        <h1 className="text-2xl font-bold">Intelligent AI-Powered Financial Advisor</h1>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Inputs */}
        <aside className="w-1/4 p-4 bg-white border-r border-gray-200 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">User Inputs</h2>

          {/* Portfolio Weights */}
          <section className="mb-6">
            <h3 className="text-lg font-medium mb-2">Portfolio Stocks</h3>
            <div className="space-y-2">
              {mockStocks.map((stock) => (
                <div key={stock.symbol} className="flex items-center">
                  <span className="flex-1">{stock.name} ({stock.symbol})</span>
                  <input
                    type="number"
                    placeholder="Weight %"
                    className="w-24 p-1 border border-gray-300 rounded"
                    onChange={(e) => handleAddStock(stock.symbol, parseFloat(e.target.value))}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Risk Tolerance */}
          <section className="mb-6">
            <h3 className="text-lg font-medium mb-2">Risk Tolerance (1-10)</h3>
            <input
              type="range"
              min={1}
              max={10}
              value={riskTolerance}
              onChange={(e) => setRiskTolerance(parseInt(e.target.value))}
              className="w-full"
            />
            <p className="text-center">{riskTolerance}</p>
          </section>

          {/* Investment Horizon */}
          <section className="mb-6">
            <h3 className="text-lg font-medium mb-2">Investment Horizon (Years)</h3>
            <input
              type="number"
              value={horizon}
              onChange={(e) => setHorizon(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </section>

          {/* Assumptions */}
          <section className="mb-6">
            <h3 className="text-lg font-medium mb-2">Assumptions</h3>
            <textarea
              value={assumptions}
              onChange={(e) => setAssumptions(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              rows={4}
            />
          </section>

          {/* Scenario Toggles */}
          <section className="mb-6">
            <h3 className="text-lg font-medium mb-2">Scenario</h3>
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
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
                    x: { title: { display: true, text: 'Risk (Std Dev)' } },
                    y: { title: { display: true, text: 'Return (%)' } },
                  },
                }}
              />
            </div>
          </div>

          {/* Projected Portfolio Growth */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-2">Projected Portfolio Growth</h3>
            <div className="h-64">
              <Line
                data={mockGrowthData}
                options={{
                  scales: {
                    x: { title: { display: true, text: 'Time' } },
                    y: { title: { display: true, text: 'Value ($)' } },
                  },
                }}
              />
            </div>
          </div>

          {/* Risk-Return Trade-offs (Placeholder) */}
          <div>
            <h3 className="text-lg font-medium mb-2">Risk-Return Trade-offs</h3>
            <p className="text-gray-600">Additional visualizations or metrics can be added here (e.g., Sharpe Ratio, etc.).</p>
          </div>
        </section>
      </main>
    </div>
  );
}