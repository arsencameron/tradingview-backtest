import { AreaSeries, createChart, ColorType } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';

const ChartComponent = ({ data, colors = {} }) => {
    const {
        backgroundColor = 'white',
        lineColor = '#2962FF',
        textColor = 'black',
        areaTopColor = 'white',
        areaBottomColor = 'rgba(255, 255, 255, 0.28)',
    } = colors;

    const chartContainerRef = useRef();

    useEffect(() => {
        // Sort the data by time and remove duplicates
        const sortedData = [...data]
            .sort((a, b) => a.time - b.time)  // Sort by time
            .filter((value, index, self) => {
                return index === 0 || value.time !== self[index - 1].time;  // Remove duplicates
            });

        // Create chart instance
        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: backgroundColor },
                textColor,
            },
            width: chartContainerRef.current.clientWidth,
            height: 300,
        });

        chart.timeScale().fitContent();

        // Add AreaSeries to the chart
        const newSeries = chart.addSeries(AreaSeries, { 
            lineColor, 
            topColor: areaTopColor, 
            bottomColor: areaBottomColor 
        });

        // Set the sorted and deduplicated data for the chart
        newSeries.setData(sortedData);

        // Resize chart on window resize
        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        };

        window.addEventListener('resize', handleResize);

        // Cleanup chart on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [data, backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor]);

    return <div ref={chartContainerRef} />;
};

export default ChartComponent;
