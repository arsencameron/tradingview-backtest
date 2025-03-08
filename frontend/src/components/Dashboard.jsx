import React, { useState } from 'react';
import './Dashboard.css';
import { Layers, BarChart2, Settings } from 'lucide-react';
import ChartComponent from './ChartComponent';
import Papa from 'papaparse';

// Sample data 
const testData = [
  { time: '2018-12-22', value: 32.51 },
  { time: '2018-12-23', value: 31.11 },
  { time: '2018-12-24', value: 27.02 },
  { time: '2018-12-25', value: 27.32 },
  { time: '2018-12-26', value: 25.17 },
  { time: '2018-12-27', value: 28.89 },
  { time: '2018-12-28', value: 25.46 },
  { time: '2018-12-29', value: 23.92 },
  { time: '2018-12-30', value: 22.68 },
  { time: '2018-12-31', value: 22.67 },
];

const samplePredictions = [
  { symbol: 'AAPL', predictedMove: 2.3, confidence: 85, signal: 'buy' },
  { symbol: 'MSFT', predictedMove: -0.8, confidence: 72, signal: 'hold' },
  { symbol: 'GOOGL', predictedMove: 1.5, confidence: 68, signal: 'buy' },
  { symbol: 'AMZN', predictedMove: 3.2, confidence: 92, signal: 'buy' },
  { symbol: 'NVDA', predictedMove: -1.2, confidence: 75, signal: 'sell' },
];

const samplePositions = [
  { symbol: 'AAPL', shares: 100, entryPrice: 165.42, currentPrice: 178.72, pl: 1330.0, plPercent: 8.03 },
  { symbol: 'MSFT', shares: 50, entryPrice: 310.15, currentPrice: 328.79, pl: 932.0, plPercent: 6.01 },
  { symbol: 'AMZN', shares: 75, entryPrice: 160.3, currentPrice: 178.75, pl: 1383.75, plPercent: 11.51 },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [riskLevel, setRiskLevel] = useState('medium');
  const [modelMetrics, setModelMetrics] = useState({
    accuracy: 78.5,
    sharpeRatio: 2.14,
    sortino: 2.68,
    maxDrawdown: -12.4,
    totalReturn: 24.8
  });

  {/* File Parsing */}
  const [csvData, setCsvData] = useState(null);

  const handleCsvFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Use PapaParse to parse the CSV file
      Papa.parse(file, {
        complete: (result) => {
          // Map to JSON format (customize this according to your CSV structure)
          const jsonData = result.data.map((row) => ({
            // Convert time to only the date part (YYYY-MM-DD)
            time: new Date(row['time']).getTime() / 1000,  // Convert time to Unix timestamp
            value: parseFloat(row['price'] || 0),  // Use price field (or 0 if empty)
          }));
  
          // Sort the data by time in ascending order
          jsonData.sort((a, b) => a.time - b.time);
  
          // Set the parsed and sorted data
          setCsvData(jsonData); 
        },
        header: true, // Treat the first row as headers
        skipEmptyLines: true, // Skip empty lines in the CSV
      });
    }
  };

  return (
    
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="header-title">Backtesting Dashboard</h1>
        </div>
      </header>

      {/* Main layout */}
      <div className="main-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <ul>
              <li>
                <button
                  className={`sidebar-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  <Layers className="icon" />
                  <span className="btn-text">Dashboard</span>
                </button>
              </li>
              <li>
                <button
                  className={`sidebar-btn ${activeTab === 'performance' ? 'active' : ''}`}
                  onClick={() => setActiveTab('performance')}
                >
                  <BarChart2 className="icon" />
                  <span className="btn-text">Performance</span>
                </button>
              </li>
              <li>
                <button
                  className={`sidebar-btn ${activeTab === 'settings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('settings')}
                >
                  <Settings className="icon" />
                  <span className="btn-text">Settings</span>
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Content */}
        <main className="content-area">
          {activeTab === 'dashboard' && (
            <div className="tab-content">
              <h2 className="section-title">Dashboard Overview</h2>

              {/* Model metrics */}
              <div className="metrics-grid">
                <div className="metric-card">
                  <h3 className="metric-label">Accuracy</h3>
                  <p className="metric-value">{modelMetrics.accuracy}%</p>
                </div>
                <div className="metric-card">
                  <h3 className="metric-label">Sharpe Ratio</h3>
                  <p className="metric-value">{modelMetrics.sharpeRatio}</p>
                </div>
                <div className="metric-card">
                  <h3 className="metric-label">Sortino Ratio</h3>
                  <p className="metric-value">{modelMetrics.sortino}</p>
                </div>
                <div className="metric-card">
                  <h3 className="metric-label">Max Drawdown</h3>
                  <p className="metric-value negative">{modelMetrics.maxDrawdown}%</p>
                </div>
                <div className="metric-card">
                  <h3 className="metric-label">Total Return</h3>
                  <p className="metric-value positive">+{modelMetrics.totalReturn}%</p>
                </div>


              </div>

              {/* Performance chart */}
              <div>        
                {/* File input to upload CSV */}
                <input type="file" accept=".csv" onChange={handleCsvFileUpload} />
                
                {/* Pass csvData to ChartComponent*/}
                {csvData && <ChartComponent data={csvData} />}
                {/* {csvData && <pre>{JSON.stringify(csvData, null, 2)}</pre>} */}
              </div>
              
              <ChartComponent data={testData} />

              {/* Latest predictions */}
              <div className="card table-card">
                <div className="table-header">
                  <h3 className="table-title">Predictions</h3>
                </div>
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Symbol</th>
                        <th>Predicted Move</th>
                        <th>Confidence</th>
                        <th>Signal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {samplePredictions.slice(0, 3).map((prediction, i) => (
                        <tr key={i}>
                          <td>{prediction.symbol}</td>
                          <td
                            className={
                              prediction.predictedMove > 0 ? 'positive' : 'negative'
                            }
                          >
                            {prediction.predictedMove > 0 ? '+' : ''}
                            {prediction.predictedMove}%
                          </td>
                          <td>
                            <div className="progress-bg">
                              <div
                                className={
                                  prediction.confidence > 80
                                    ? 'progress-bar high'
                                    : prediction.confidence > 60
                                    ? 'progress-bar medium'
                                    : 'progress-bar low'
                                }
                                style={{ width: `${prediction.confidence}%` }}
                              ></div>
                            </div>
                            <span className="confidence-text">
                              {prediction.confidence}%
                            </span>
                          </td>
                          <td>
                            <span
                              className={`signal-badge ${
                                prediction.signal === 'buy'
                                  ? 'buy'
                                  : prediction.signal === 'sell'
                                  ? 'sell'
                                  : 'hold'
                              }`}
                            >
                              {prediction.signal.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'predictions' && (
            <div className="tab-content">
              <h2 className="section-title">Model Predictions</h2>
              <div className="card table-card">
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Symbol</th>
                        <th>Predicted Move</th>
                        <th>Confidence</th>
                        <th>Signal</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {samplePredictions.map((prediction, i) => (
                        <tr key={i}>
                          <td>{prediction.symbol}</td>
                          <td
                            className={
                              prediction.predictedMove > 0 ? 'positive' : 'negative'
                            }
                          >
                            {prediction.predictedMove > 0 ? '+' : ''}
                            {prediction.predictedMove}%
                          </td>
                          <td>
                            <div className="progress-bg">
                              <div
                                className={
                                  prediction.confidence > 80
                                    ? 'progress-bar high'
                                    : prediction.confidence > 60
                                    ? 'progress-bar medium'
                                    : 'progress-bar low'
                                }
                                style={{ width: `${prediction.confidence}%` }}
                              ></div>
                            </div>
                            <span className="confidence-text">
                              {prediction.confidence}%
                            </span>
                          </td>
                          <td>
                            <span
                              className={`signal-badge ${
                                prediction.signal === 'buy'
                                  ? 'buy'
                                  : prediction.signal === 'sell'
                                  ? 'sell'
                                  : 'hold'
                              }`}
                            >
                              {prediction.signal.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <button
                              className={`action-button ${
                                prediction.signal === 'buy'
                                  ? 'buy-button'
                                  : prediction.signal === 'sell'
                                  ? 'sell-button'
                                  : 'hold-button'
                              }`}
                            >
                              {prediction.signal === 'buy'
                                ? 'Buy'
                                : prediction.signal === 'sell'
                                ? 'Sell'
                                : 'Hold'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'positions' && (
            <div className="tab-content">
              <h2 className="section-title">Current Positions</h2>
              <div className="card table-card">
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Symbol</th>
                        <th>Shares</th>
                        <th>Entry Price</th>
                        <th>Current Price</th>
                        <th>P&amp;L</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {samplePositions.map((position, i) => (
                        <tr key={i}>
                          <td>{position.symbol}</td>
                          <td>{position.shares}</td>
                          <td>${position.entryPrice.toFixed(2)}</td>
                          <td>${position.currentPrice.toFixed(2)}</td>
                          <td className={position.pl >= 0 ? 'positive' : 'negative'}>
                            ${position.pl.toFixed(2)} (
                            {position.plPercent >= 0 ? '+' : ''}
                            {position.plPercent.toFixed(2)}%)
                          </td>
                          <td>
                            <button className="action-button close-button">Close</button>
                            <button className="action-button edit-button">Edit</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="tab-content">
              <h2 className="section-title">Model Performance</h2>
              <div className="performance-grid">
                <div className="card chart-card">
                  <h3 className="chart-title">Cumulative Returns</h3>
                  <div className="chart-wrapper">
                    <ChartComponent data={testData} />
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="chart-title">Performance Metrics</h3>
                <div className="metrics-grid smaller">
                  <div className="metric-card">
                    <h4 className="metric-label">Accuracy</h4>
                    <p className="metric-value">{modelMetrics.accuracy}%</p>
                  </div>
                  <div className="metric-card">
                    <h4 className="metric-label">Sharpe Ratio</h4>
                    <p className="metric-value">{modelMetrics.sharpeRatio}</p>
                  </div>
                  <div className="metric-card">
                    <h4 className="metric-label">Sortino Ratio</h4>
                    <p className="metric-value">{modelMetrics.sortino}</p>
                  </div>
                  <div className="metric-card">
                    <h4 className="metric-label">Max Drawdown</h4>
                    <p className="metric-value negative">{modelMetrics.maxDrawdown}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="tab-content">
              <h2 className="section-title">Model Settings</h2>
              <div className="card settings-card">
                <h3 className="settings-title">Trading Parameters</h3>

                <div className="form-group">
                  <label className="label">Risk Level</label>
                  <div className="button-group">
                    <button
                      className={`switch-button ${riskLevel === 'low' ? 'switch-active' : ''}`}
                      onClick={() => setRiskLevel('low')}
                    >
                      Low
                    </button>
                    <button
                      className={`switch-button ${riskLevel === 'medium' ? 'switch-active' : ''}`}
                      onClick={() => setRiskLevel('medium')}
                    >
                      Medium
                    </button>
                    <button
                      className={`switch-button ${riskLevel === 'high' ? 'switch-active' : ''}`}
                      onClick={() => setRiskLevel('high')}
                    >
                      High
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">SlideBar 1</label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    defaultValue="5"
                    className="range-input"
                  />
                  <div className="range-scale">
                    <span>1%</span>
                    <span>5%</span>
                    <span>10%</span>
                    <span>15%</span>
                    <span>20%</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">Slidebar 2</label>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    defaultValue="70"
                    className="range-input"
                  />
                  <div className="range-scale">
                    <span>50%</span>
                    <span>60%</span>
                    <span>70%</span>
                    <span>80%</span>
                    <span>90%</span>
                  </div>
                </div>

                <div className="form-group">
                  <button className="save-button">Save Settings</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;