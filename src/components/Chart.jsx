import React, { useEffect, useRef } from 'react';
import './Chart.css';
import { widget } from '../../charting_library';
import { Datafeed } from './datafeed.js'

function Chart({ valueData, cashData }) {
  const chartContainerRef = useRef(null);
  const tvWidgetRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current) {
      return;
    }
    

    // 1) Create a single datafeed instance for both sets of data
    const myDataFeed = new Datafeed(valueData, cashData);

    // 2) Instantiate the chart widget
    const widgetOptions = {
      symbol: 'PORTFOLIO_VALUE',
      interval: 'D',  // daily
      datafeed: myDataFeed,
      container: chartContainerRef.current,
      library_path: '../../charting_library/',
      locale: 'en',
      disabled_features: [
        'use_localstorage_for_settings',
      ],
      enabled_features: [
        'study_templates'
      ],
      overrides: {
        "mainSeriesProperties.style": 2, // 2 = line chart
        "mainSeriesProperties.lineStyle.linewidth": 2,
        "mainSeriesProperties.lineStyle.color": "#2962FF",
        "mainSeriesProperties.priceAxisProperties.percentage": false,
        "mainSeriesProperties.lineStyle.linestyle": 0
      },
      autosize: true,
      theme: 'Dark' // or 'Light'
    };

    tvWidgetRef.current = new widget(widgetOptions);

    tvWidgetRef.current.onChartReady(() => {
      console.log('Chart is ready');

      // The correct way to add a second series is using the compare functionality
      const chart = tvWidgetRef.current.chart();
      
      // Add the second symbol as a compare series
      chart.createStudy(
        'Compare', 
        false, 
        false, 
        ["close", "CASH", "#FF5722", 2], // symbol, color, line width
        null,
        {
          "Compare.style": 1, 
          "Plot.linewidth": 2
        }
      );
    });

    return () => {
      if (tvWidgetRef.current) {
        tvWidgetRef.current.remove();
        tvWidgetRef.current = null;
      }
    };
  }, [valueData, cashData]);

  return (
    <div
      ref={chartContainerRef}
      style={{ width: '100%', height: '70vh' }}
    />
  );
}

export default Chart;