import axios from "axios";
import { DiAws } from "react-icons/di";

const API = axios.create({
    baseURL: "http://127.0.0.1:8001/"
});

const fetchPrice = async () => {
    try {
        const res = await API.get("price/data");
        return res.data;
    } catch (err) {
        console.error("Failed to fetch data: ", err);
        return {};
    }
}

export default fetchPrice;