import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import Chart from 'react-apexcharts';
import ReactApexChart from "react-apexcharts";


export default function CandlestickChart({ priceData, account, symbol, historyData }) {
    const candleInterval = 60 * 1000; // 1 minute

    // 1️⃣ Initialize with history data
    const [candles, setCandles] = useState(() =>
        historyData
            .slice()
            .reverse()
            .map(item => ({
                x: new Date(item.date).getTime(),
                y: [
                    parseFloat(item.open),
                    parseFloat(item.high),
                    parseFloat(item.low),
                    parseFloat(item.close)
                ]
            }))
    );

    // 2️⃣ Process live ticks
    useEffect(() => {
        if (!priceData[account] || !priceData[account][symbol]) return;

        const arrayLive = priceData?.[account]?.[symbol];
        if (!arrayLive) return;
        const newCandles = [...candles]; // copy so we can update
        const ticks = Array.isArray(arrayLive) ? arrayLive : [arrayLive];

        ticks.forEach(tickRaw => {
            const tick = {
                bid: parseFloat(tickRaw.bid),
                time: new Date(tickRaw.Date).getTime()
            };

            const candleStart = Math.floor(tick.time / candleInterval) * candleInterval;
            let lastCandle = newCandles[newCandles.length - 1];

            if (!lastCandle || lastCandle.x !== candleStart) {
                // New candle
                newCandles.push({
                    x: candleStart,
                    y: [tick.bid, tick.bid, tick.bid, tick.bid]
                });
            } else {
                // Update existing candle
                const [open, high, low, close] = lastCandle.y;
                lastCandle.y = [
                    open,
                    Math.max(high, tick.bid),
                    Math.min(low, tick.bid),
                    tick.bid
                ];
            }
        });

        setCandles(newCandles);
    }, [priceData, account, symbol]);

    // 3️⃣ Chart config
    const options = {
        chart: { type: "candlestick", height: 350 },
        xaxis: { type: "datetime" },
        yaxis: { tooltip: { enabled: true } }
    };

    return (
        <div>
            <ReactApexChart options={options} series={[{ data: candles }]} type="candlestick" height={350} />
        </div>
    );
}
