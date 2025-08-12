import React, { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

export default function CandlestickChart({ ohlcData, account, symbol, historyData }) {
    const chartContainerRef = useRef();
    const chartRef = useRef();
    const candleSeriesRef = useRef();

    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Create chart once
        chartRef.current = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight || 400,
            layout: {
                background: { color: "#253248" },
                textColor: "rgba(255, 255, 255, 0.9)",
            },
            grid: {
                vertLines: { color: "#2B2B43" },
                horzLines: { color: "#2B2B43" },
            },
        });

        candleSeriesRef.current = chartRef.current.addCandlestickSeries({
            upColor: "#4bffb5",
            downColor: "#ff4976",
            borderDownColor: "#ff4976",
            borderUpColor: "#4bffb5",
            wickDownColor: "#838ca1",
            wickUpColor: "#838ca1",
        });

        return () => {
            chartRef.current.remove();
            chartRef.current = null;
            candleSeriesRef.current = null;
        };
    }, []); // run once on mount

    useEffect(() => {
        if (!ohlcData[account] || !ohlcData[account][symbol]) return;
        if (!candleSeriesRef.current) return;

        // Format historical data
        const combinedData = [...historyData]
            .map(item => {
                if (!item.date) return null;
                const dateStr = item.date.replace(/\./g, '-');
                const time = Math.floor(new Date(dateStr).getTime() / 1000);
                if (isNaN(time)) return null;
                return {
                    time,
                    open: item.open,
                    high: item.high,
                    low: item.low,
                    close: item.close,
                };
            })
            .filter(Boolean)
            .sort((a, b) => a.time - b.time);

        candleSeriesRef.current.setData(combinedData);

        // Format latest OHLC update
        const candlesArray = ohlcData[account] && ohlcData[account][symbol] ? [ohlcData[account][symbol]] : [];
        const updatedData = candlesArray
            .map(item => {
                if (!item.date) return null;
                const dateStr = item.date.replace(/\./g, '-');
                const time = Math.floor(new Date(dateStr).getTime() / 1000);
                if (isNaN(time)) return null;
                return {
                    time,
                    open: item.open,
                    high: item.high,
                    low: item.low,
                    close: item.close,
                };
            })
            .filter(Boolean);

        if (updatedData.length > 0) {
            const lastCandleTime = combinedData.length ? combinedData[combinedData.length - 1].time : 0;
            if (updatedData[0].time >= lastCandleTime) {
                candleSeriesRef.current.update(updatedData[0]);
            } else {
                console.warn("Skipping update because updatedData time is older than last candle");
            }
        }
    }, [ohlcData, account, symbol, historyData]);


    return (
        <div
            ref={chartContainerRef}
            style={{ width: "100%", height: "400px" }}
        />
    );
}
