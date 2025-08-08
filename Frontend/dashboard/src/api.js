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

function useFetchSocket(url) {
    const [data, setData] = useState(null);
    const socketRef = useRef(null);
    useEffect(() => {
        socketRef.current = new WebSocket(url);

        socketRef.current.onopen = () => {
            console.log("WebSocket connected");
        };

        socketRef.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            setData(message);
        };

        socketRef.current.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        socketRef.current.onclose = () => {
            console.log(`WebSocket disconnected from ${url}`);
        };

        return () => {
            socketRef.current.close();
        };
    }, [url]);

    return data;
}

export default fetchPrice;
export {useFetchSocket};