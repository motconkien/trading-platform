import { AreaSeries, BarSeries, BaselineSeries, createChart, CrosshairMode } from 'lightweight-charts';
import React, { useRef, useEffect, useState } from 'react';
import { priceData } from '../components/priceData';
import { volumeData } from '../components/volumeData';
import CandlestickChart from '../components/candlestick';
import { fetchHistory } from '../api';


function Dashboard() {
    const [historyData, setHistoryData] = useState([]);

    const fakeOhlcData = {
        "102117821": {
            "AUDJPYc": [
                { open: 96.20, high: 96.32, low: 96.14, close: 96.25, date: "2025-08-09 00:00" },
                { open: 96.25, high: 96.40, low: 96.20, close: 96.12, date: "2025-08-09 00:30" },
                { open: 96.35, high: 96.50, low: 96.30, close: 96.45, date: "2025-08-09 01:00" }
            ],
            "AUDCADc": [
                { open: 0.6, high: 0.89685, low: 0.89596, close: 0.89616, date: "2025-08-09 00:00" },
                { open: 0.7, high: 0.89700, low: 0.89600, close: 0.89650, date: "2025-08-09 00:30" },
                { open: 0.8, high: 0.89720, low: 0.89630, close: 0.89680, date: "2025-08-09 01:00" }
            ]
        }
    };


    // State for selected account & symbol
    const [selectedAccount, setSelectedAccount] = useState("102117821");
    const [selectedSymbol, setSelectedSymbol] = useState("AUDJPYc");

    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchHistory(selectedAccount, selectedSymbol);
            setHistoryData(data);
        };
        fetchData();
    }, [selectedAccount, selectedSymbol]);

    return (
        <div style={{ padding: "20px", background: "#0e1a24", minHeight: "100vh" }}>
            <h2 style={{ color: "white" }}>Trading Dashboard</h2>

            {/* Account selector */}
            <label style={{ color: "white" }}>Account:</label>
            <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                style={{ margin: "0 10px" }}
            >
                {Object.keys(fakeOhlcData).map(acc => (
                    <option key={acc} value={acc}>{acc}</option>
                ))}
            </select>

            {/* Symbol selector */}
            <label style={{ color: "white" }}>Symbol:</label>
            <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                style={{ margin: "0 10px" }}
            >
                {Object.keys(fakeOhlcData[selectedAccount]).map(sym => (
                    <option key={sym} value={sym}>{sym}</option>
                ))}
            </select>

            {/* Chart */}
            <div style={{ marginTop: "20px" }}>
                <CandlestickChart
                    ohlcData={fakeOhlcData}
                    account={selectedAccount}
                    symbol={selectedSymbol}
                    historyData={historyData}
                />
            </div>
        </div>
    );
}
export default Dashboard;