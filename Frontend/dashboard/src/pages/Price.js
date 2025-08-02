import { useEffect, useState } from "react";
import fetchPrice from "../api";


function Dashboard() {
    const [priceData, setPriceData] = useState({});

    const getPrice = async () => {
        const data = await fetchPrice();
        setPriceData(data);
        // console.log(data);

    };
    useEffect(() => {

        getPrice();
        const intervalId = setInterval(() => {
            getPrice();
        }, 500);
        return () => clearInterval(intervalId);
    }, []);
    return (
        <div className="price-page">
            <div className="stick-container">
                <h1>LPs Price</h1>
            </div>
            <div className="table-container">
                {Object.keys(priceData).length > 0 ? (
                    <table className="price-table">
                        <thead>
                            <tr>
                                <th style={{ width: '50%' }}>Account</th>
                                <th style={{ width: '50%' }}>Symbol</th>
                                <th style={{ width: '50%' }}>Bid</th>
                                <th style={{ width: '50%' }}>Ask</th>
                                <th style={{ width: '50%' }}>Spread</th>
                                <th style={{ width: '50%' }}>Swap long</th>
                                <th style={{ width: '50%' }}>Swap short</th>
                            </tr>
                        </thead>

                        <tbody>
                            {/* flatten data by objec.entries to return the list of list */}
                            {priceData &&
                                Object.entries(priceData).flatMap(([account, symbols]) => (
                                    // console.log(priceData)
                                    Object.entries(symbols).map(([symbol, tick]) => (
                                        <tr key={`${account}-${symbol}`}>
                                            <td>{account}</td>
                                            <td>{symbol}</td>
                                            <td>{tick.bid}</td>
                                            <td>{tick.ask}</td>
                                            <td>{tick.spread}</td>
                                            <td>{tick.swap_long}</td>
                                            <td>{tick.swap_short}</td>
                                        </tr>
                                    ))
                                ))}
                        </tbody>
                    </table>
                ) : (<p>No data available</p>)}
            </div>

        </div>
    )
};
export default Dashboard;