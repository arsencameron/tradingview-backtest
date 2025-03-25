export class Datafeed {
  constructor(valueData, cashData, signalData) {
    this.dataMap = {
      PORTFOLIO_VALUE: valueData, // array of { time, value }
      CASH: cashData,             // array of { time, value }
    };
    
    this.signalData = signalData || [];
    this.supportedResolutions = ['1D'];
  }

  onReady(callback) {
    console.log('[onReady]: Method call');
    setTimeout(() => callback({
      supported_resolutions: this.supportedResolutions,
      supports_marks: true,
      supports_timescale_marks: true
    }));
  }

  searchSymbols(userInput, exchange, symbolType, onResultReadyCallback) {
    console.log('[searchSymbols]: Method call');
    // Return available symbols that match the search
    const symbols = Object.keys(this.dataMap).map(symbol => ({
      symbol: symbol,
      ticker: symbol,
      description: symbol === 'PORTFOLIO_VALUE' ? 'Portfolio Value' : 'Cash Balance',
      exchange: "PLTR",
      type: "line"
    })).filter(sym => 
      sym.symbol.toLowerCase().includes(userInput.toLowerCase())
    );
    
    onResultReadyCallback(symbols);
  }

  resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback, extension) {
    console.log('[resolveSymbol]: Method call', symbolName);
    
    if (!this.dataMap[symbolName]) {
      console.log('[resolveSymbol]: Cannot resolve symbol', symbolName);
      onResolveErrorCallback('Symbol not found');
      return;
    }
  
    const symbolInfo = {
      name: symbolName,
      ticker: symbolName,
      description: symbolName === 'PORTFOLIO_VALUE' ? 'Portfolio Value' : 'Cash Balance',
      exchange: "TEST",
      session: '24x7',
      timezone: 'Etc/UTC',
      pricescale: 100,
      minmov: 1,
      has_intraday: true,
      has_weekly_and_monthly: false,
      supported_resolutions: this.supportedResolutions,
      volume_precision: 0,
      data_status: 'streaming',
      type: 'line', 
      format: 'price' 
    };
    
    console.log('[resolveSymbol]: Symbol resolved', symbolName);
    onSymbolResolvedCallback(symbolInfo);
  }

  getBars(symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) {
    const { from, to, firstDataRequest } = periodParams;
    console.log('[getBars]: Method call', symbolInfo, resolution, from, to);
    
    try {
      const rawData = this.dataMap[symbolInfo.name];
      if (!rawData || rawData.length === 0) {
        onHistoryCallback([], { noData: true });
        return;
      }
  
      // Convert data to OHLC format for line chart
      const bars = rawData.map(point => {
        const val = parseFloat(point.value);
        // Ensure time is in milliseconds
        const timeMs = typeof point.time === 'number' ? 
                       (point.time > 10000000000 ? point.time : point.time * 1000) : 
                       new Date(point.time).getTime();
        
        return {
          time: timeMs,
          open: val,
          high: val,
          low: val,
          close: val
        };
      });
  
      // Filter to the requested range
      const filteredBars = bars.filter(bar => 
        bar.time >= from * 1000 && bar.time <= to * 1000
      );
  
      console.log(`[getBars]: Returning ${filteredBars.length} bars`);
      onHistoryCallback(filteredBars, { noData: filteredBars.length === 0 });
    } catch (error) {
      console.error('[getBars] error:', error);
      onErrorCallback(error);
    }
  }

  subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) {
    console.log('[subscribeBars]: Method call with subscriberUID:', subscriberUID);
    // Implement if you need real-time updates
  }

  unsubscribeBars(subscriberUID) {
    console.log('[unsubscribeBars]: Method call with subscriberUID:', subscriberUID);
    // Implement if you need real-time updates
  }

  // getMarks(symbolInfo, from, to, onDataCallback, resolution) {

  //   if (!this.signalData || this.signalData.length === 0) {
  //     console.warn('No signal data available');
  //     onDataCallback([]);
  //     return;
  //   }
  
  //   const marks = this.signalData
  //     .filter(signal => {
  //       const isWithinTimeRange = signal.time >= from && signal.time <= to;
  //       console.log(`Signal ${signal.id || 'unknown'} time check:`, {
  //         signalTime: signal.time,
  //         from,
  //         to,
  //         isWithinRange: isWithinTimeRange
  //       });
  //       return isWithinTimeRange;
  //     })
  //     .map(signal => {
  //       // Handle trade signals
  //       if (signal.type === 'trade') {
  //         console.log('Processing trade signal:', signal);
  //         const tradeMark = {
  //           imageUrl: signal.side === 'buy' ? "/src/assets/indicators/buy-indicator.png" : "/src/assets/indicators/sell-indicator.png",
  //           id: signal.id || Math.random().toString(),
  //           label: '',
  //           time: signal.time, 
  //           color: signal.side === 'buy' ? 'green' : 'red',
  //           minSize: 30,
  //           point: { time: signal.time, price: 0 },
  //           // Detailed hover text
  //           text: `
  //             Trade:
  //             - Side: ${signal.side.toUpperCase()}
  //             - Symbol: ${signal.symbol || 'N/A'}
  //             - Price: $${signal.price.toFixed(2)}
  //             - Strategy: ${signal.strategy || 'N/A'}
              
  //             Trade Specifics:
  //             - Quantity: ${signal.tradeDetails?.tradeQuantity || 'N/A'}
  //             - Trade Cost: $${signal.tradeDetails?.tradeCost?.toFixed(2) || 'N/A'}
              
  //             ${signal.assetType === 'option' && signal.optionDetails ? `Option Details:
  //               - Expiration: ${signal.optionDetails.expiration || 'N/A'}
  //               - Multiplier: ${signal.optionDetails.multiplier || 'N/A'}` : ''}
  //           `,
  //           label: signal.side === 'buy' ? 'B' : 'S',
  //         };
  //         console.log('Created trade mark:', tradeMark);
  //         return tradeMark;
  //       }
        
  //       // Handle indicator signals
  //       if (signal.type === 'indicator') {
  //         console.log('Processing indicator signal:', signal);
  //         const indicatorMark = {
  //           id: signal.id,
  //           time: signal.time,
  //           label: ' ',
  //           color: signal.color || 'blue',
  //           minSize: 30,
  //           // Detailed hover text
  //           text: `
  //             Indicator:
  //             - Name: ${signal.name}
  //             - Value: ${signal.value}
  //             - Color: ${signal.color || 'Default'}
  //             - Symbol: ${signal.symbol || 'N/A'}
  //           `,
  //         };
  //         console.log('Created indicator mark:', indicatorMark);
  //         return indicatorMark;
  //       }
        
  //       // Fallback for unknown signal types
  //       console.warn('Unknown signal type:', signal);
  //       return null;
  //     })
  //     .filter(mark => mark !== null); // Remove any null entries
  
  //   console.log(`Filtered marks count: ${marks.length}`);
  //   console.log('Marks:', marks);
  
  //   onDataCallback(marks);
  // }

  getTimescaleMarks = (
    symbolInfo,
    startDate,
    endDate,
    onDataCallback,
    resolution
  ) => {
    if (!this.signalData || this.signalData.length === 0) {
      console.warn('[getTimescaleMarks] No signal data available');
      onDataCallback([]);
      return;
    }
    const marks = this.signalData
      .map(signal => {
        // Handle trade signals
        if (signal.type === 'trade') {
          return {
            id: signal.identifier || Math.random().toString(),
            imageUrl: signal.side === 'buy' ? "/src/assets/indicators/buy-indicator.png" : "/src/assets/indicators/sell-indicator.png",
            time: signal.time,
            color: signal.side === 'buy' ? 'green' : 'red',
            label: signal.side === 'buy' ? 'B' : 'S',
            minSize: 30,
            tooltip: [
              `Side: ${signal.side.toUpperCase()}`,
              `Symbol: ${signal.symbol || 'N/A'}`,
              `Price: $${signal.price.toFixed(2)}`,
              `Strategy: ${signal.strategy || 'N/A'}`,
              `Quantity: ${signal.tradeDetails?.tradeQuantity || 'N/A'}`,
              `Trade Cost: $${signal.tradeDetails?.tradeCost?.toFixed(2) || 'N/A'}`,
              ...(signal.assetType === 'option' && signal.optionDetails 
                ? [
                  `Expiration: ${signal.optionDetails.expiration || 'N/A'}`,
                  `Multiplier: ${signal.optionDetails.multiplier || 'N/A'}`
                ]
                : [])
            ]
          };
        }
        
        // Handle indicator signals
        if (signal.type === 'indicator') {
          return {
            id: signal.id,
            time: signal.time,
            color: signal.color || 'blue',
            shape: signal.symbol,
            label: ' ',
            minSize: 30,
            tooltip: [
              `ID: ${signal.id}`,
              `Name: ${signal.name}`,
              `Size: ${signal.size || 'N/A'}`,
              `Value: ${signal.value}`,
              `Color: ${signal.color || 'Default'}`,
              `Symbol: ${signal.symbol || 'N/A'}`,
            ]
          };
        }
        
        // Fallback for unknown signal types
        console.warn('Unknown signal type:', signal);
        return null;
      })
      .filter(mark => mark !== null); // Remove any null entries
  
    console.log(`Filtered marks count: ${marks.length}`);
    console.log('Marks:', marks);
  
    onDataCallback(marks);
  };
}