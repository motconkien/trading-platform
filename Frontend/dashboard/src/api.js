import axios from "axios";
import { DiAws } from "react-icons/di";
import { useEffect, useState, useRef } from "react";


const API = axios.create({
    baseURL: "http://127.0.0.1:8001/"
});

const fetchPrice = async () => {
    try {
        const res = await API.get("price/data");
        // const res = await API.get("ws://localhost:8000/ws/tick")
        return res.data;
    } catch (err) {
        console.error("Failed to fetch data: ", err);
        return {};
    }
}

const fetchHistory = async (account, symbol) => {
    try {
        const res = await API.get(`ohlc/history/${account}/${symbol}/100`);
        console.log("History data fetched: ", res.data);
        return res.data;
    } catch (err) {
        console.error("Failed to fetch history data: ", err);
        return [];
    }
}

const fetchOhlc = async () => {
    try {
        const res = await API.get("ohlc/data");
        console.log("OHLC data fetched: ", res.data);
        return res.data;
    } catch (err) {
        console.error("Failed to fetch OHLC data: ", err);
        return {};
    }
}

function useFetchSocket(url) {
    const [data, setData] = useState(null);
    const socketRef = useRef(null);
    useEffect(() => {
        let reconnect;
        let pingInterval;
        const connect = () => {
            socketRef.current = new WebSocket(url);

            socketRef.current.onopen = () => {
                console.log("WebSocket connected");

                //send heartbeat every 20s 
                pingInterval = setInterval(() => {
                    if (socketRef.current?.readyState === WebSocket.OPEN) {
                        socketRef.current.send('ping');
                    }
                }, 20000)
            };

            socketRef.current.onmessage = (event) => {
                console.log("Socket message received:", event.data);
                if (event.data === "pong") return;
                const message = JSON.parse(event.data);
                setData(message);
            };

            socketRef.current.onerror = (error) => {
                console.error("WebSocket error:", error);
            };

            socketRef.current.onclose = () => {
                console.log(`WebSocket disconnected from ${url}`);
                clearInterval(pingInterval)
                reconnect = setTimeout(connect, 2000);
            };
        }

        connect();


        return () => {
            clearInterval(pingInterval);
            socketRef.current?.close();
        };
    }, [url]);

    return data;
}

export default fetchPrice;
export { useFetchSocket, fetchHistory, fetchOhlc, API };