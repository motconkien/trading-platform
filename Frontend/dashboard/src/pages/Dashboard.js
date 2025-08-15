import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { priceData } from '../components/priceData';
import { volumeData } from '../components/volumeData';
import MidPriceChart from '../components/candlestick';
import { fetchHistory, useFetchSocket, fetchOhlc, API } from '../api';


function Dashboard() {
    const [historyData, setHistoryData] = useState([]);
    const [initialData, setInitialData] = useState([]); //for the first ininitial
    const [newPoint, setNewPoints] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState("102117821");
    const [selectedSymbol, setSelectedSymbol] = useState("AUDJPYc");
    const [priceData, setPriceData] = useState()



    const tickData = useFetchSocket("ws://localhost:8001/ws/tick");
    // console.log("Tick: ", tickData);

    const fetchHistoryData = async (account, symbol) => {
        try {
            const res = await API.get(`tick/history/${account}/${symbol}/200`);
            console.log("History data fetched: ", res.data.length);
            setHistoryData(res.data);

        } catch (error) {
            console.error("Error fetching history data:", error);
        }
    }

    useEffect(() => {
        fetchHistoryData(selectedAccount, selectedSymbol);
        // const intervalId = setInterval(() => {
        //     fetchHistoryData(selectedAccount, selectedSymbol);
        // }, 1000);

        // return () => clearInterval(intervalId);
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
        setInitialData(hisData);
    }, [historyData])

    // find new point
    useEffect(() => {
        if (tickData && Object.keys(tickData).length > 0) {
            setPriceData(tickData);
            const info = tickData[selectedAccount][selectedSymbol];
            const formattedTick = {
                time: info.date.replace(/\./g, '-'),
                bid: info.bid,
                ask: info.ask
            };
            //console.log("Test: ", formattedTick);
            setNewPoints(formattedTick);

        }
    }, [tickData, selectedAccount, selectedSymbol]);

    //console.log("New Tick.  ", newPoint);
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

            <div className='chart-container'>
                <div id='chart'>
                    <MidPriceChart tickData={initialData} newPoint={newPoint} />
                </div>
            </div>

        </div>
    );
}
export default Dashboard;