import { AreaSeries, BarSeries, BaselineSeries, createChart, CrosshairMode } from 'lightweight-charts';
import React, { useRef, useEffect, useState } from 'react';
import { priceData } from '../components/priceData';
import { volumeData } from '../components/volumeData';
import MidPriceChart from '../components/candlestick';
import { fetchHistory, useFetchSocket, fetchOhlc, API } from '../api';


function Dashboard() {
    const [historyData, setHistoryData] = useState([]);
    // const ohlcdata = useFetchSocket("ws://localhost:8001/ws/ohlc");
    const [priceData, setPriceData] = useState({});
    const [newTick, setNewTick] = useState();

    const [selectedAccount, setSelectedAccount] = useState("102117821");
    const [selectedSymbol, setSelectedSymbol] = useState("AUDJPYc");

    // change this after testing

    const tickData = useFetchSocket("ws://localhost:8001/ws/tick");
    // console.log("Tick: ", tickData);


    const fetchHistoryData = async (account, symbol) => {
        try {
            const res = await API.get(`tick/history/${account}/${symbol}/100`);
            console.log("History data fetched: ", res.data);
            setHistoryData(res.data);

        } catch (error) {
            console.error("Error fetching history data:", error);
        }
    }

    // const fetchOHLC = async () => {
    //     try {
    //         const res = await API.get('ohlc/data');
    //         // console.log("ohlc data fetched: ", res.data);
    //         setOhlcData(res.data);
    //     } catch (error) {
    //         console.error("Error fetching ohlc data:", error);
    //         setError("Failed to fetch ohlc data");
    //     }
    // }

    useEffect(() => {
        // fetchOHLC();  // runs after first render
        fetchHistoryData(selectedAccount, selectedSymbol); // fetch initial history data

        const intervalId = setInterval(() => {
            fetchHistoryData(selectedAccount, selectedSymbol);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [selectedAccount, selectedSymbol]);

    useEffect(() => {

        const hisData = historyData
            .slice()
            .reverse()
            .map(item => ({
                date: item.date,
                bid: item.bid,
                ask: item.ask
            }));
        setPriceData(hisData);
    }, [historyData])



    return (
        <div style={{ padding: "20px", minHeight: "100vh" }}>
            <h2>Trading Dashboard</h2>

            {/* Account selector */}
            <label>Account:</label>
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
            <label>Symbol:</label>
            <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                style={{ margin: "0 10px" }}
            >
                {tickData && Object.keys(tickData[selectedAccount] || {}).map(sym => (
                    <option key={sym} value={sym}>{sym}</option>
                ))}

            </select>

            { }

            <div>
                <MidPriceChart tickData={historyData}/>
            </div>

        </div>
    );
}
export default Dashboard;