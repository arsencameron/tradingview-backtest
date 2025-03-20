import React, { useEffect, useRef } from 'react';

// Custom Datafeed class
class CustomDatafeed {
  constructor(valueData) {
    this.valueData = valueData;
  }

  onReady(callback) {
    callback({
      supports_search: false,
      supports_group_request: false,
      supports_marks: false,
      supports_timescale_marks: false,
    });
  }

  getBars(symbolInfo, resolution, from, to, onDataCallback, onErrorCallback) {
    const filteredData = this.valueData.filter((dataPoint) => dataPoint.time >= from && dataPoint.time <= to);
    const bars = filteredData.map((dataPoint) => ({
      time: dataPoint.time,
      close: dataPoint.value,
      open: dataPoint.value,
      high: dataPoint.value,
      low: dataPoint.value,
    }));

    onDataCallback(bars);
  }
}

const Chart = ({ valueData, cashData }) => {
  const chartContainerRef = useRef(null);

  useEffect(() => {
    let widget;

    if (chartContainerRef.current && valueData && valueData.length > 0) {
      const widgetOptions = {
        container: chartContainerRef.current,
        locale: 'en',
        library_path: '/charting_library/',
        datafeed: new CustomDatafeed(valueData),
        interval: '1D',
        fullscreen: false,
        debug: true,
        symbol: 'NASDAQ:AAPL', // Add a default symbol
      };

      widget = new TradingView.widget(widgetOptions);

      widget.onChartReady(() => {
        const linePoints = valueData.map((dataPoint) => ({
          time: dataPoint.time,
          price: dataPoint.value,
        }));

        widget.createMultipointShape(linePoints, {
          shape: "trend_line",
          lock: false,
          disableSelection: false,
          disableSave: false,
          disableUndo: false,
          overrides: {
            linecolor: "#00FF00",
            linestyle: 0,
            linewidth: 2,
            showLabels: true,
            showPoints: true,
            pointcolor: "#FF0000",
            pointsize: 6,
          },
        });
      });
    }

    return () => {
      if (widget) {
        widget.remove();
      }
    };
  }, [valueData, cashData]);

  return <div ref={chartContainerRef} style={{ height: '400px', width: '100%' }} />;
};

export default Chart;