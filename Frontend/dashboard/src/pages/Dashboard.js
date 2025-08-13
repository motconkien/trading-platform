import { AreaSeries, BarSeries, BaselineSeries, createChart, CrosshairMode } from 'lightweight-charts';
import React, { useRef, useEffect, useState } from 'react';
import { priceData } from '../components/priceData';
import { volumeData } from '../components/volumeData';
import CandlestickChart from '../components/candlestick';
import { fetchHistory, useFetchSocket, fetchOhlc, API } from '../api';


function Dashboard() {
    const [historyData, setHistoryData] = useState([]);
    // const ohlcdata = useFetchSocket("ws://localhost:8001/ws/ohlc");
    const [ohlcdata, setOhlcData] = useState({});
    const [error, setError] = useState(null);
    const [priceData, setPriceData] = useState({});

    const [selectedAccount, setSelectedAccount] = useState("102117821");
    const [selectedSymbol, setSelectedSymbol] = useState("AUDJPYc");

    // change this after testing

    const tickData = useFetchSocket("ws://localhost:8001/ws/tick");
    console.log("Tick: ", tickData);

    const fakePriceData = {
        "102117821": {
            "AUDJPYc": [
                { bid: 96.423, Date: "2025-08-13 12:13:51" },
                { bid: 96.425, Date: "2025-08-13 12:13:52" },
                { bid: 96.427, Date: "2025-08-13 12:13:53" },
                { bid: 96.426, Date: "2025-08-13 12:13:54" }
            ],
            "EURUSDc": [
                { bid: 1.1023, Date: "2025-08-13 12:13:51" },
                { bid: 1.1025, Date: "2025-08-13 12:13:52" },
                { bid: 1.1024, Date: "2025-08-13 12:13:53" },
                { bid: 1.1026, Date: "2025-08-13 12:13:54" }
            ]
        }
    };


    const fetchHistoryData = async (account, symbol) => {
        try {
            const res = await API.get(`ohlc/history/${account}/${symbol}/100`);
            // console.log("History data fetched: ", res.data);
            setHistoryData(res.data);

        } catch (error) {
            console.error("Error fetching history data:", error);
            setError("Failed to fetch history data");
        }
    }

    const fetchOHLC = async () => {
        try {
            const res = await API.get('ohlc/data');
            // console.log("ohlc data fetched: ", res.data);
            setOhlcData(res.data);
        } catch (error) {
            console.error("Error fetching ohlc data:", error);
            setError("Failed to fetch ohlc data");
        }
    }

    useEffect(() => {
        fetchOHLC();  // runs after first render
        fetchHistoryData(selectedAccount, selectedSymbol); // fetch initial history data

        const intervalId = setInterval(() => {
            fetchOHLC();
        }, 100);

        return () => clearInterval(intervalId);
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
                {tickData && Object.keys(tickData).map(acc => (
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
                {tickData && Object.keys(tickData[selectedAccount] || {}).map(sym => (
                    <option key={sym} value={sym}>{sym}</option>
                ))}

            </select>

            {/* Chart */}
            <div style={{ marginTop: "20px" }}>
                {tickData?.[selectedAccount]?.[selectedSymbol] && (
                    <CandlestickChart
                        priceData={tickData}
                        account={selectedAccount}
                        symbol={selectedSymbol}
                        historyData={historyData}
                    />
                )}
            </div>

        </div>
    );
}
export default Dashboard;