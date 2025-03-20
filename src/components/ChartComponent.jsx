import { createYieldCurveChart, LineSeries } from 'lightweight-charts';
import React, { useState, useEffect, useRef } from 'react';


const ChartComponent = ({ valueData = [], cashData = [], colors = {} }) => {
    const {
        backgroundColor = '#1e1e1e',
        textColor = 'white',
        valueLineColor = '#2962FF',
        cashLineColor = '#FF5733',
    } = colors;

    const chartContainerRef = useRef();
    const [legend, setLegend] = useState({
        value: 'Portfolio Value',
        cash: 'Cash',
    });

    useEffect(() => {
        if (!valueData.length || !cashData.length) return;

        const chartOptions = {
            layout: {
                textColor,
                background: { type: 'solid', color: backgroundColor },
            },
            yieldCurve: {
                baseResolution: 1,  // 1 unit per time step (e.g., 1 month)
                minimumTimeRange: 10,  // Minimum space between data points
                startTimeRange: 3,  // Spread out the beginning of the plot
            },
            handleScroll: true,
            handleScale: true,
            priceScale: {
                // Format the Y-axis labels to remove percentage symbols
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1,
                },
                borderVisible: false,
                formatter: (price) => price.toFixed(2), // Format the price to remove the percentage sign and set 2 decimal places
            },
        };

        const chart = createYieldCurveChart(chartContainerRef.current, chartOptions);

        // Create series for portfolio value
        const valueSeries = chart.addSeries(LineSeries, { color: valueLineColor });
        console.log("hi");

        // Create series for cash
        const cashSeries = chart.addSeries(LineSeries, { color: cashLineColor });

        // Prepare the data for portfolio value and cash
        const valueChartData = valueData.map((item, index) => ({
            time: index + 1,  // Use index to spread data linearly
            value: item.value,
        }));

        const cashChartData = cashData.map((item, index) => ({
            time: index + 1,  // Use index to spread data linearly
            value: item.value,
        }));

        console.log(valueChartData);
        // Set the data for both series
        valueSeries.setData(valueChartData);
        cashSeries.setData(cashChartData);

        chart.timeScale().fitContent();

        // Resize chart on window resize
        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [valueData, cashData, backgroundColor, textColor, valueLineColor, cashLineColor]);

    return (
        <div>
            <div ref={chartContainerRef} style={{ width: '100%', height: '400px' }} />
            <div className="legend" style={{ display: 'flex', marginTop: '10px', color: textColor }}>
                <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
                    <span style={{ backgroundColor: valueLineColor, width: '15px', height: '15px', marginRight: '5px' }}></span>
                    {legend.value}
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ backgroundColor: cashLineColor, width: '15px', height: '15px', marginRight: '5px' }}></span>
                    {legend.cash}
                </div>
            </div>
        </div>
    );
};

export default ChartComponent;