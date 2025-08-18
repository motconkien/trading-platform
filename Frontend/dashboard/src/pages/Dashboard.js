import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { priceData } from '../components/priceData';
import { volumeData } from '../components/volumeData';
import MidPriceChart, { SwapChart } from '../components/candlestick';
import { fetchHistory, useFetchSocket, fetchOhlc, API } from '../api';


function Dashboard() {
    const [historyData, setHistoryData] = useState([]);
    const [initialData, setInitialData] = useState([]); //for the first ininitial
    const [swapHistData, setSwapHist] = useState([]);
    const [swapData, setSwapData] = useState([]);
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

    const fetchSwapHistory = async (account, symbol) => {
        try {
            const res = await API.get(`swap/history/${account}/${symbol}/200`);
            console.log("History data fetched: ", res.data.length);
            setSwapHist(res.data);
        } catch (error) {
            console.error("Error fetching history swap data:", error)
        }
    }
    useEffect(() => {
        fetchHistoryData(selectedAccount, selectedSymbol);
        fetchSwapHistory(selectedAccount, selectedSymbol);
        // const intervalId = setInterval(() => {
        //     fetchHistoryData(selectedAccount, selectedSymbol);
        // }, 1000);

        // return () => clearInterval(intervalId);
    }, [selectedAccount, selectedSymbol]);

    useEffect(() => {
        if (!historyData || !historyData.length) return;

        const hisData = historyData.slice().reverse().map(item => ({
            date: item.date,
            bid: item.bid,
            ask: item.ask
        }));
        setInitialData(hisData);

    }, [historyData]);

    useEffect(() => {
        if (!swapHistData || !swapHistData.length) return;
        const swapData = swapHistData.slice().reverse().map(item => ({
            date: item.date,
            swapshort: item.swap_short,
            swaplong: item.swap_long // fixed typo
        }));
        setSwapData(swapData);
    }, [swapHistData])


    // find new point
    useEffect(() => {
        if (tickData&& Object.keys(tickData).length > 0) {
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

        // for test
        // let intervalId;

        // intervalId = setInterval(() => {
        //     const now = new Date();
        //     const formattedTime = now.toISOString().replace("T", " ").split(".")[0];

        //     const fakeTick = {
        //         time: formattedTime,
        //         bid: (95 + Math.random()).toFixed(3), // around 95.x
        //         ask: (95.2 + Math.random()).toFixed(3) // around 95.2x
        //     };

        //     console.log("Fake Tick:", fakeTick);
        //     setNewPoints(fakeTick);
        // }, 1000); // every 2 seconds

        // return () => clearInterval(intervalId);

    }, [tickData, selectedAccount, selectedSymbol]);

    //fake swap
    const fakeSwap = [
        { date: "2025-07-31", swaplong: -6.1, swapshort: -4.2 },
        { date: "2025-08-01", swaplong: -5.9, swapshort: -4.0 },
        { date: "2025-08-02", swaplong: -6.3, swapshort: -3.8 },
        { date: "2025-08-03", swaplong: -6.0, swapshort: -4.1 },
        { date: "2025-08-04", swaplong: -6.2, swapshort: -4.3 },
        { date: "2025-08-05", swaplong: -5.8, swapshort: -4.0 },
        { date: "2025-08-06", swaplong: -6.1, swapshort: -4.1 },
        { date: "2025-08-07", swaplong: -6.0, swapshort: -3.9 },
        { date: "2025-08-08", swaplong: -6.2, swapshort: -4.2 },
        { date: "2025-08-09", swaplong: -5.9, swapshort: -4.0 },
        { date: "2025-08-10", swaplong: -6.0, swapshort: -4.1 },
        { date: "2025-08-11", swaplong: -6.3, swapshort: -4.2 },
        { date: "2025-08-12", swaplong: -6.1, swapshort: -3.9 },
        { date: "2025-08-13", swaplong: -6.0, swapshort: -4.0 },
        { date: "2025-08-14", swaplong: -6.2, swapshort: -4.3 },
        { date: "2025-08-15", swaplong: -5.9, swapshort: -4.1 },
        { date: "2025-08-16", swaplong: -6.0, swapshort: -4.0 }
    ]
    

    console.log("New Tick.  ", newPoint);
    console.log("Swap Hist: ", swapData)
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
                <div id='chart-price'>
                    <MidPriceChart tickData={initialData} newPoint={newPoint} />
                </div>
            </div>

            <div className='chart-container'>
                <div id='chart-swap'>
                    <SwapChart swapData={swapData} />
                </div>
            </div>

        </div>
    );
}
export default Dashboard;