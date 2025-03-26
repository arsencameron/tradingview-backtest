import { BarChart2, Layers, Settings, TrendingUp } from 'lucide-react';
import Papa from 'papaparse';
import React, { useEffect, useState } from 'react';
import Chart from './Chart.jsx';
import './Dashboard.css';
import logo from "../assets/logo.png";


function calculateStdDev(data){
  let n = data.length;
  if (n === 0) return 0; // Avoid division by zero
  let mean = data.reduce((sum, value) => sum + value, 0) / n;
  let squaredDiffs = data.map(value => Math.pow(value - mean, 2));
  let variance = squaredDiffs.reduce((sum, value) => sum + value, 0) / n;
  return Math.sqrt(variance);
}

function calculateDownStdDev(returns, riskFreeRate = 0) {
  let n = returns.length;
  if (n === 0) return 0;

  let downsideSquaredDiffs = returns
      .filter(r => r < riskFreeRate) // Only consider returns below the risk-free rate
      .map(r => Math.pow(r - riskFreeRate, 2));

  let downsideVariance = downsideSquaredDiffs.reduce((sum, value) => sum + value, 0) / n;
  return Math.sqrt(downsideVariance);
}

function calculateSharpeRatio(returns, riskFreeRate = 0) {
  let n = returns.length;
  if (n === 0) return 0; 

  let meanReturn = returns.reduce((sum, value) => sum + value, 0) / n;
  let stdDev = calculateStdDev(returns); // Use your stdDev function
  console.log("Sharpe Real: " + (meanReturn - riskFreeRate) / stdDev);
  console.log("stdDevMean: " + meanReturn);
  console.log("stdDev: " + stdDev);
  return (meanReturn - riskFreeRate) / stdDev;
}

function calculateSortinoRatio (returns, riskFreeRate = 0) {
  let n = returns.length;
  if (n === 0) return 0; 

  let meanReturn = returns.reduce((sum, value) => sum + value, 0) / n;
  let stdDev = calculateDownStdDev(returns, riskFreeRate); // Use your stdDev function
  console.log("Sortino Real: " + (meanReturn - riskFreeRate) / stdDev);
  return (meanReturn - riskFreeRate) / stdDev;

  }


const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [riskLevel, setRiskLevel] = useState('medium');

  {/* File Parsing */}
  const [statsData, setStatsData] = useState(null);
  const [markersData, setMarkersData] = useState(null);
  const [totalReturn, setTotalReturn] = useState(0);
  const [annualReturn, setAnnualReturn] = useState(0);
  const [maxDrawdown, setMaxDrawdown] = useState(0);
  const [sortinoRatio, setSortinoRatio] = useState(0);
  const [sharpeRatio, setSharpeRatio] = useState(0);


  {/* Tearsheet Data Display */}
  const [tearsheetData, setTearsheetData]  = useState([]);

  useEffect(() => {
    parseStats();
    parseMarkers();
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
    const numericValue = parseFloat(stringValue.replace(',', '').replace('%', ''));
    return numericValue >= 0 ? 'positive' : 'negative';
  };


  //Stores all value and cash data
  //Also computes total return, CAGR, and max drawdown
  const parseStats = () => {
    const filePath = '../../data/stats.csv'; 
  
    fetch(filePath)
      .then((response) => response.text())
      .then((data) => {
        Papa.parse(data, {
          complete: (result) => {
            const valueData = [];
            const cashData = [];
            let returnData = result.data.map(row => Number(row.return)).filter(val => val !== "" && val != null && !isNaN(val));
            let sharpe = calculateSharpeRatio(returnData);
            let sortino = calculateSortinoRatio(returnData);

            setSortinoRatio(sortino);
            setSharpeRatio(sharpe);
            
            
            // Initialize initial and final values
            let initialValue = null;
            let finalValue = null;
            let initialTimestamp = null;
            let finalTimestamp = null;
            let prevValue = 0;
            let currentMaxDrawdown = 0;
    
            result.data.forEach((row, index) => {
              const timestamp = new Date(row['datetime']).getTime() / 1000; // Convert to Unix timestamp
              const portfolioValue = parseFloat(row['portfolio_value']);
  
              if (!isNaN(portfolioValue)) {                
                // Set initial value (first entry)
                if (index === 0) {
                  initialValue = portfolioValue;
                  initialTimestamp = timestamp;
                }
                else{
                  //Right now finalValue is NOT updated
                  prevValue = finalValue;
                }
  
                // Update final value (last entry)
                finalValue = portfolioValue;
                finalTimestamp = timestamp;

                if(index != 0){
                  if((finalValue - prevValue)/prevValue < currentMaxDrawdown){
                    currentMaxDrawdown = (finalValue - prevValue)/prevValue;
                  }
                }

                // You can still store the data for further usage like graphs
                valueData.push({ time: timestamp, value: portfolioValue });
                cashData.push({ time: timestamp, value: parseFloat(row['cash'] || 0) });
              }
            });
            const formattedMaxDrawdown = new Intl.NumberFormat().format((currentMaxDrawdown*100).toFixed(2)) + '%';
            setMaxDrawdown(formattedMaxDrawdown);
            console.log("Max drawdown: " + maxDrawdown);


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

              //Get all the calculated data
              //Display more on performance page

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
            setStatsData({ valueData, cashData });
          },
          header: true,
          skipEmptyLines: true,
        });
      })
      .catch((error) => {
        console.error('Error fetching the file:', error);
      });
  };
  
  const parseMarkers = () => {
    Promise.all([
      new Promise((resolve, reject) => {
        Papa.parse('../../data/indicators.csv', {
          download: true,
          header: true,
          skipEmptyLines: true,
          complete: (result) => resolve(result.data),
          error: (err) => reject(err)
        });
      }),
      new Promise((resolve, reject) => {
        Papa.parse('../../data/option_trades.csv', {
          download: true,
          header: true,
          skipEmptyLines: true,
          complete: (result) => resolve(result.data),
          error: (err) => reject(err)
        });
      })
    ]).then(([indicatorData, tradeData]) => {
      // Process Indicators
      const indicators = indicatorData.reduce((acc, row) => {
        try {
          const time = Math.floor(parseFloat(row.timestamp));
          const value = parseFloat(row.value);
  
          if (!isNaN(time) && !isNaN(value)) {
            acc.push({
              id: row[''],
              type: 'indicator',
              time,
              size: row.size,
              value,
              name: row.name,
              detail_text: row.detail_text,
              color: row.color,
              symbol: row.symbol
            });
          }
        } catch (error) {
          console.error('Error processing indicator:', row, error);
        }
        return acc;
      }, []);
  
      const trades = tradeData.reduce((acc, row) => {
        try {
          const time = Math.floor(new Date(row.time).getTime() / 1000);
          const price = parseFloat(row.price);
          const side = row.side;
          const status = row.status;
          const assetType = row['asset.asset_type'];
          console.log("asset Type" + assetType)
      
          // Expanded validation to include more scenarios
          const isValidTrade = 
            time && 
            !isNaN(time) && 
            !isNaN(price) && 
            (side === 'buy' || side === 'sell') &&
            (status === 'fill' || status === 'open'); // Allow both filled and open trades
      
          if (isValidTrade) {
            // Base trade object
            const tradeEntry = {
              type: 'trade',
              time,
              price,
              side,
              status,
              symbol: row.symbol,
              strategy: row.strategy,
              assetType, // Include asset type explicitly
              tradeDetails: {
                identifier: row.identifier,
                timeInForce: row['time_in_force'],
                tradeQuantity: parseFloat(row['filled_quantity']),
                tradeCost: parseFloat(row['trade_cost'])
              }
            };
      
            switch (assetType) {
              case 'option':
                tradeEntry.optionDetails = row['asset.right'] ? {
                  expiration: row['asset.expiration'],
                  strike: row['asset.strike']
                } : null;
                break;
              default:
                // Log unknown asset types for debugging
                console.warn('Unknown asset type:', assetType, row);
            }
      
            acc.push(tradeEntry);
          }
        } catch (error) {
          console.error('Error processing trade:', row, error);
        }
        return acc;
      }, []);
  
      // Combine and sort markers
      const combinedMarkers = [...indicators, ...trades]
        .sort((a, b) => a.time - b.time);
  
      console.log('Combined Markers:', combinedMarkers);
      
      // Set the combined markers data
      setMarkersData(combinedMarkers);
    }).catch(error => {
      console.error('Error parsing CSV files:', error);
    });
  };


  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <img src={logo} alt="" className="logo"/>
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
                    {totalReturn}
                  </p>
                </div>
              </div>

              <div className="metric-card">
                <h3 className="metric-label">CAGR Annual Return:</h3>
                <div className="metric-value">
                  <p className={`annual-return ${getClassByValue(totalReturn)}`}>
                    {annualReturn}
                  </p>
                </div>
              </div>

              <div className="metric-card">
                <h3 className="metric-label">Max Drawdown:</h3>
                <div className="metric-value">
                  <p className={`max-drawdown ${getClassByValue(maxDrawdown)}`}>
                    {maxDrawdown}
                  </p>
                </div>
              </div>

              <div className="metric-card">
                <h3 className="metric-label">Sortino Ratio:</h3>
                <div className="metric-value">
                  <p className={`max-drawdown ${getClassByValue(sortinoRatio)}`}>
                    {sortinoRatio.toFixed(3)}
                  </p>
                </div>
              </div>

              <div className="metric-card">
                <h3 className="metric-label">Sharpe Ratio:</h3>
                <div className="metric-value">
                  <p className={`max-drawdown ${getClassByValue(sharpeRatio)}`}>
                    {sharpeRatio.toFixed(3)}
                  </p>
                </div>
              </div>


              </div>

              {/* Performance chart */}
              <div>        
                {/* {statsData && statsData.valueData && statsData.cashData && (
                  <Chart valueData={statsData.valueData} cashData={statsData.cashData} signalData={[
                    { time: '2025-01-15', price: 105.25, action: 'BUY' },
                    { time: '2025-02-10', price: 112.75, action: 'SELL' }]}/>
                )} */}

                {statsData && statsData.valueData && statsData.cashData && (
                  <Chart valueData={statsData.valueData} cashData={statsData.cashData} signalData={markersData}/>
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