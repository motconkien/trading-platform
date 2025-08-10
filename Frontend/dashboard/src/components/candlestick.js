import React, { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

export default function CandlestickChart({ ohlcData, account, symbol, historyData }) {
    const chartContainerRef = useRef();

    useEffect(() => {
        if (!ohlcData[account] || !ohlcData[account][symbol]) return;

        // Create chart
        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight || 400,
            layout: {
                background: { color: "#253248" },
                textColor: "rgba(255, 255, 255, 0.9)",
            },
            grid: {
                vertLines: { color: "#2B2B43" },
                horzLines: { color: "#2B2B43" },
            }
        });

        // Add candle series
        const candleSeries = chart.addCandlestickSeries({
            upColor: "#4bffb5",
            downColor: "#ff4976",
            borderDownColor: "#ff4976",
            borderUpColor: "#4bffb5",
            wickDownColor: "#838ca1",
            wickUpColor: "#838ca1",
        });

        // Format and set data
        const formattedData = (ohlcData[account] && ohlcData[account][symbol]) || [];

        const combinedData = [...historyData, ...formattedData]
            .map(item => {
                if (!item.date) {
                    console.warn("Missing date in item:", item);
                    return null;
                }
                // Replace dots with dashes for safe date parsing
                const time = Math.floor(new Date(item.date).getTime() / 1000);
                if (isNaN(time)) {
                    console.warn("Invalid date skipped:", item.date);
                    return null;
                }
                return {
                    time,
                    open: item.open,
                    high: item.high,
                    low: item.low,
                    close: item.close
                };
            })
            .filter(Boolean)  // Remove nulls from invalid data
            .sort((a, b) => a.time - b.time); // Sort by time ascending

        // Debug log
        combinedData.forEach(item => console.log("Formatted item time:", item.time));

        candleSeries.setData(combinedData);


        // Cleanup when component unmounts or data changes
        return () => chart.remove();

    }, [ohlcData, account, symbol]);

    return (
        <div
            ref={chartContainerRef}
            style={{ width: "100%", height: "400px" }}
        />
    );
}
