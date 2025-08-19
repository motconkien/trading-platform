import { useEffect, useState } from "react";
import { fetchPrice, useFetchSocket } from "../api";
import { currencyData, metalsSymbols } from "../components/dumpData";

function Dashboard() {
    const [priceData, setPriceData] = useState({});
    const [dislayData, setDisplayData] = useState({});
    const [prevPriceData, setPrevPriceData] = useState({});
    const [selectedSymbols, setSelectedSymbols] = useState([]);
    const [open, setOpen] = useState(false);


    const tickData = useFetchSocket("ws://localhost:8001/ws/tick");
    console.log("tickdata: ", tickData);

    useEffect(() => {
        if (tickData && Object.keys(tickData).length > 0) {
            setPriceData(tickData);
            setPrevPriceData(prev => prev !== tickData ? tickData : prev);

            const arrange = {};
            Object.entries(tickData).forEach(([account, symbols]) => {
                const filteredSymbols = Object.entries(symbols).filter(([symbol]) =>
                    parseInt(account) != 72317552 ? (currencyData.includes(symbol))
                        : (currencyData.includes(symbol.slice(0, 6))));

                filteredSymbols.sort((a, b) => parseInt(account) != 72317552
                    ? (currencyData.indexOf(a[0]) - currencyData.indexOf(b[0]))
                    : (currencyData.indexOf(a[0].slice(0, 6)) - currencyData.indexOf(b[0].slice(0, 6)))
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

    const selectedSymbol = selectedSymbols.length > 0 ? selectedSymbols : currencyData;

    const toggleSymbol = (sym) => {
        setSelectedSymbols((prev) =>
            prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
        );
    };


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
                <div className="header">
                    <h1>LPs Price</h1>
                </div>
                <div className="dropwdown">
                    <button onClick={() => setOpen(!open)} className="dropdown-toggle">
                        {selectedSymbols.length > 0
                            ? `Chosen (${selectedSymbols.length})`
                            : "All Symbols"}
                    </button>

                    {open && (
                        <div className="dropdown-menu">
                            {currencyData.map((sym) => (
                                <label key={sym} className="dropdown-item">
                                    <input
                                        type="checkbox"
                                        checked={selectedSymbols.includes(sym)}
                                        onChange={() => toggleSymbol(sym)}
                                    />
                                    {sym}
                                </label>
                            ))}
                        </div>
                    )}
                </div>

            </div>
            <div className="table-container">
                {Object.keys(dislayData).length > 0 ? (
                    Object.entries(dislayData).map(([account, symbols]) => (
                        <table className="price-table" key={account}>
                            <thead>
                                <tr className="account-header">
                                    <th rowSpan="2">Symbol</th>
                                    <th colSpan="5">{account}</th>
                                </tr>
                                <tr className="row-header">
                                    <th>Bid</th>
                                    <th>Ask</th>
                                    <th>Spread</th>
                                    <th>Swap Long</th>
                                    <th>Swap Short</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedSymbol.map((sym) => {
                                    const tick = symbols[sym];
                                    return (
                                        <tr key={`${account}-${sym}`}>
                                            <td>{sym}</td>
                                            {tick ? (
                                                <>
                                                    <td className={getColorClass(account, sym, "bid", tick.bid)}>
                                                        {tick.bid}
                                                    </td>
                                                    <td className={getColorClass(account, sym, "ask", tick.ask)}>
                                                        {tick.ask}
                                                    </td>
                                                    <td>{tick.spread}</td>
                                                    <td>{tick.swap_long}</td>
                                                    <td>{tick.swap_short}</td>
                                                </>
                                            ) : (
                                                <>
                                                    <td colSpan="5" className="no-data">-</td>
                                                </>
                                            )}
                                        </tr>
                                    );
                                })}
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