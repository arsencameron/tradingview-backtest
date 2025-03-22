import { BarChart2, Layers, Settings, TrendingUp } from 'lucide-react';
import Papa from 'papaparse';
import React, { useEffect, useState } from 'react';
import ChartComponent from './ChartComponent';
import './Dashboard.css';
import { TVChartContainer } from './TVChartContainer';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [riskLevel, setRiskLevel] = useState('medium');
  const [modelMetrics, setModelMetrics] = useState({
    accuracy: 78.5,
    sharpeRatio: 2.14,
    sortino: 2.68,
    maxDrawdown: -12.4,
    totalReturn: 24.8,
    annualReturn: 631.97,
    longestDDDays: 112
  });

  {/* File Parsing */}
  const [csvData, setCsvData] = useState(null);
  const [totalReturn, setTotalReturn] = useState(0);
  const [annualReturn, setAnnualReturn] = useState(0);


  {/* Tearsheet Data Display */}
  const [tearsheetData, setTearsheetData]  = useState([]);

  useEffect(() => {
    handleCsvFileRead();
    fetch('/tearsheet_data.json')  
      .then((response) => response.json())
      .then((tearsheetData) => {
        setTearsheetData(tearsheetData);  
        console.log(tearsheetData);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const getClassByValue = (value) => {
    // Ensure the value is a string and handle cases where it's a number or undefined
    const stringValue = value ? value.toString() : '';
  
    // Remove commas and percentage sign if present
    const numericValue = parseFloat(stringValue.replace(',', '').replace('%', ''));
  
    // Return the appropriate class based on the numeric value
    return numericValue >= 0 ? 'positive' : 'negative';
  };
  
  const calculateCAGR = (initialValue, finalValue, initialTimestamp, finalTimestamp) => {
    const years = (finalTimestamp - initialTimestamp) / (365 * 24 * 60 * 60 * 1000);
  
    const cagr = ((finalValue / initialValue) ** (1 / years) - 1) * 100;
  
    return cagr.toFixed(2);  // Return as percentage with 2 decimal places
  };

  const handleCsvFileRead = () => {
    const filePath = '../../data/BullCallSpreadPLTR_2025-02-10_19-32_jQXFGf_stats.csv'; 
  
    fetch(filePath)
      .then((response) => response.text())
      .then((data) => {
        Papa.parse(data, {
          complete: (result) => {
            const valueData = [];
            const cashData = [];
            
            // Initialize initial and final values
            let initialValue = null;
            let finalValue = null;
            let initialTimestamp = null;
            let finalTimestamp = null;
    
            result.data.forEach((row, index) => {
              const timestamp = new Date(row['datetime']).getTime() / 1000; // Convert to Unix timestamp
              const portfolioValue = parseFloat(row['portfolio_value']);
  
              if (!isNaN(portfolioValue)) {
                // Set initial value (first entry)
                if (index === 0) {
                  initialValue = portfolioValue;
                  initialTimestamp = timestamp;
                }
  
                // Update final value (last entry)
                finalValue = portfolioValue;
                finalTimestamp = timestamp;

                // You can still store the data for further usage like graphs
                valueData.push({ time: timestamp, value: portfolioValue });
                cashData.push({ time: timestamp, value: parseFloat(row['cash'] || 0) });
              }
            });
  
            if (initialValue !== null && finalValue !== null) {
              const rawTotalReturn = (((finalValue - initialValue) / initialValue) * 100).toFixed(0);
              // Format with comma and percentage sign
              const formattedTotalReturn = new Intl.NumberFormat().format(rawTotalReturn) + '%';
              setTotalReturn(formattedTotalReturn); // Store formatted value

              const initialDate = new Date(initialTimestamp*1000);  // Convert initial timestamp to ISO format and then parse
              const finalDate = new Date(finalTimestamp*1000);      // Convert final timestamp to ISO format and then parse

              console.log("Initial Date:", initialDate);
              console.log("Final Date:", finalDate);

              // Check if the timestamps are valid dates
              if (isNaN(initialDate) || isNaN(finalDate)) {
                console.error('Invalid date values');
                return;
              }

              // Ensure that the final date is after the initial date
              if (initialDate >= finalDate) {
                console.error('Final date must be after initial date');
                return;
              }

              // Calculate the difference in milliseconds
              const timeDifference = finalDate - initialDate;

              // Convert the time difference from milliseconds to years
              const years = timeDifference / (1000 * 60 * 60 * 24 * 365.25);  // 365.25 to account for leap years

              // If the time difference is too short (less than a year), return 0 years to avoid infinite results
              if (years <= 0) {
                console.error('Time period is too short');
                return;
              }

              // Calculate the CAGR (if years > 0)
              const rawCAGR = ((Math.pow(finalValue / initialValue, 1 / years) - 1) * 100).toFixed(2);  // CAGR formula
              const formattedCAGR = new Intl.NumberFormat().format(rawCAGR) + '%';  // Format with comma and percentage sign
              setAnnualReturn(formattedCAGR); // Store formatted CAGR value
            }
  
            // Sort the data by time
            valueData.sort((a, b) => a.time - b.time);
            cashData.sort((a, b) => a.time - b.time);
  
            // Set the CSV data
            setCsvData({ valueData, cashData });
            console.log('Total Return:', totalReturn);
          },
          header: true,
          skipEmptyLines: true,
        });
      })
      .catch((error) => {
        console.error('Error fetching the file:', error);
      });
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
              <li>
                <button
                  className={`sidebar-btn ${activeTab === 'settings' ? 'active' : ''}`}
                  onClick={() => window.open("/BullCallSpreadPLTR_2025-02-10_19-32_jQXFGf_tearsheet.html", "_blank")}
                  >
                  <TrendingUp className="icon" />
                  <span className="btn-text">Tearsheet</span>
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
                <h3 className="metric-label">Total Return:</h3>
                <div className="metric-value">
                  <p className={`total-return-value ${getClassByValue(totalReturn)}`}>
                    Strategy: {totalReturn}
                  </p>
                </div>
              </div>

              <div className="metric-card">
                <h3 className="metric-label">CAGR Annual Return:</h3>
                <div className="metric-value">
                  <p className={`annual-return ${getClassByValue(totalReturn)}`}>
                    Strategy: {annualReturn}
                  </p>
                </div>
              </div>


              </div>

              {/* Performance chart */}
              <div>        
                {/* {csvData && <ChartComponent valueData={csvData.valueData} cashData={csvData.cashData} />} */}
                {/* {csvData && <Chart valueData={csvData.valueData} cashData={csvData.cashData} />} */}
                {csvData && csvData.valueData && csvData.cashData && (
                  <TVChartContainer valueData={csvData.valueData} cashData={csvData.cashData} />
                )}
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
                  <div className="metric-card">
                    <h4 className="metric-label">Annual Return</h4>
                    <p className="metric-value positive">{modelMetrics.annualReturn}%</p>
                  </div>
                  <div className="metric-card">
                    <h4 className="metric-label">Longest DD Days</h4>
                    <p className="metric-value positive">{modelMetrics.longestDDDays}%</p>
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