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

  // Your existing getMarks method is already correct
  getMarks(symbolInfo, from, to, onDataCallback, resolution) {
    if (!this.signalData || this.signalData.length === 0) {
      onDataCallback([]);
      return;
    }

    const marks = this.signalData
      .filter(signal => {
        const time = new Date(signal.time).getTime();
        return time >= from * 1000 && time <= to * 1000;
      })
      .map(signal => ({
        id: signal.id || Math.random().toString(),
        imageUrl: signal.action === 'BUY' ? "/src/assets/indicators/sell-indicator.png" : "/src/assets/indicators/buy-indicator.png",
        time: new Date(signal.time).getTime() / 1000, // Convert to seconds
        color: signal.action === 'BUY' ? 'red' : 'green',
        text: signal.action === 'BUY' ? 'BUY' : 'SELL',
        label: signal.action === 'BUY' ? 'B' : 'S',
        labelFontColor: '#FFFFFF',
        minSize: 30,
      }));

    onDataCallback(marks);
  }
}