import React, { useEffect, useRef, useState } from 'react';
import { widget } from '../../charting_library';
import './TVChartContainer.css';

function getLanguageFromURL() {
  const regex = new RegExp('[\\?&]lang=([^&#]*)');
  const results = regex.exec(window.location.search);
  return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

export const TVChartContainer = () => {
  const chartContainerRef = useRef();
  const [libraryLoaded, setLibraryLoaded] = useState(false);

  const defaultProps = {
    symbol: 'AAPL',
    interval: 'D',
    datafeedUrl: 'https://demo_feed.tradingview.com',
    libraryPath: '/charting_library/',
    chartsStorageUrl: 'https://saveload.tradingview.com',
    chartsStorageApiVersion: '1.1',
    clientId: 'tradingview.com',
    userId: 'public_user_id',
    fullscreen: false,
    autosize: true,
    studiesOverrides: {},
  };

  useEffect(() => {
    // Load TradingView script dynamically
    const script = document.createElement('script');
    script.src = '/charting_library/charting_library.js'; // Ensure this path is correct
    script.async = true;

    script.onload = () => {
      console.log('TradingView Charting Library Loaded');
      // Check if Datafeeds object is available
      const checkDatafeeds = setInterval(() => {
        if (window.Datafeeds && window.Datafeeds.UDFCompatibleDatafeed) {
          console.log('Datafeeds is now available!');
          setLibraryLoaded(true); // Set library as loaded when Datafeeds is ready
          clearInterval(checkDatafeeds);
        } else {
          console.warn('Waiting for Datafeeds...');
        }
      }, 100);
    };

    script.onerror = () => {
      console.error('Failed to load TradingView Charting Library');
    };

    document.body.appendChild(script);

    // Cleanup script when component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!libraryLoaded || !window.Datafeeds?.UDFCompatibleDatafeed) {
      console.warn('TradingView library or Datafeeds not ready yet.');
      return;
    }

    const widgetOptions = {
      symbol: defaultProps.symbol,
      datafeed: new window.Datafeeds.UDFCompatibleDatafeed(defaultProps.datafeedUrl),
      interval: defaultProps.interval,
      container: chartContainerRef.current,
      library_path: defaultProps.libraryPath,
      locale: getLanguageFromURL() || 'en',
      disabled_features: ['use_localstorage_for_settings'],
      enabled_features: ['study_templates'],
      charts_storage_url: defaultProps.chartsStorageUrl,
      charts_storage_api_version: defaultProps.chartsStorageApiVersion,
      client_id: defaultProps.clientId,
      user_id: defaultProps.userId,
      fullscreen: defaultProps.fullscreen,
      autosize: defaultProps.autosize,
      studies_overrides: defaultProps.studiesOverrides,
    };

    const tvWidget = new widget(widgetOptions);

    tvWidget.onChartReady(() => {
      tvWidget.headerReady().then(() => {
        const button = tvWidget.createButton();
        button.setAttribute('title', 'Click to show a notification popup');
        button.classList.add('apply-common-tooltip');
        button.addEventListener('click', () => tvWidget.showNoticeDialog({
          title: 'Notification',
          body: 'TradingView Charting Library API works correctly',
          callback: () => {
            console.log('Noticed!');
          },
        }));

        button.innerHTML = 'Check API';
      });
    });

    return () => {
      tvWidget.remove();
    };
  }, [libraryLoaded]);

  return (
    <div
      ref={chartContainerRef}
      className={'TVChartContainer'}
    />
  );
};
