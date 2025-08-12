import { useEffect, useState } from "react";
import { fetchPrice, useFetchSocket } from "../api";
import {currencyData, metalsSymbols} from "../components/dumpData";

function Dashboard() {
    const [priceData, setPriceData] = useState({});
    const [dislayData, setDisplayData] = useState({});
    const [prevPriceData, setPrevPriceData] = useState({});

    const tickData = useFetchSocket("ws://localhost:8001/ws/tick");
    // console.log("tickdata: ", tickData);

    useEffect(() => {
        if (tickData && Object.keys(tickData).length > 0) {
            setPriceData(tickData);
            setPrevPriceData(prev => prev !== tickData ? tickData : prev);

            const arrange = {};
            Object.entries(tickData).forEach(([account, symbols]) => {
                const filteredSymbols = Object.entries(symbols).filter(([symbol]) =>
                    parseInt(account) != 72317552 ? (currencyData.includes(symbol.slice(0, 6))) 
                                                    :(metalsSymbols.includes(symbol.slice(0,6))));

                filteredSymbols.sort((a, b) => parseInt(account) != 72317552 
                    ? (currencyData.indexOf(a[0].slice(0, 6)) - currencyData.indexOf(b[0].slice(0, 6)))
                    : (metalsSymbols.indexOf(a[0].slice(0, 6)) - metalsSymbols.indexOf(b[0].slice(0, 6)))
                );
                // console.log("filter: ", filteredSymbols);

                arrange[account] = {};
                filteredSymbols.forEach(([symbol, info]) => {
                    arrange[account][symbol] = info;
                })
            })
            setDisplayData(arrange);

        }
    }, [tickData]);



    const getColorClass = (account, symbol, field, currentValue) => {
        if (!prevPriceData[account] || !prevPriceData[account][symbol]) return '';
        const prevValue = prevPriceData[account][symbol][field];
        if (prevValue === undefined) return '';
        if (currentValue > prevValue) return 'price-up';
        if (currentValue < prevValue) return 'price-down';
    };


    return (
        <div className="price-page">
            <div className="stick-container">
                <h1>LPs Price</h1>
            </div>
            <div className="table-container">
                {Object.keys(dislayData).length > 0 ? (
                    Object.entries(dislayData).map(([account, symbols]) => (
                        <table className="price-table" key={account}>
                            <thead>
                                <tr className="account-header">
                                    <th colSpan="6" >
                                        {account}
                                    </th>
                                </tr>
                                <tr className="row-header">
                                    <th>Symbol</th>
                                    <th>Bid</th>
                                    <th>Ask</th>
                                    <th>Spread</th>
                                    <th>Swap Long</th>
                                    <th>Swap Short</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(symbols).map(([symbol, tick]) => (
                                    <tr key={`${account}-${symbol}`}>
                                        <td>{symbol}</td>
                                        {/* <td>{tick.bid}</td>
                                        <td>{tick.ask}</td> */}
                                        <td className={getColorClass(account, symbol, 'bid', tick.bid)}>{tick.bid}</td>
                                        <td className={getColorClass(account, symbol, 'ask', tick.ask)}>{tick.ask}</td>
                                        <td>{tick.spread}</td>
                                        <td>{tick.swap_long}</td>
                                        <td>{tick.swap_short}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ))
                ) : (
                    <p>No data available</p>
                )}

            </div>

        </div>
    )
};
export default Dashboard;