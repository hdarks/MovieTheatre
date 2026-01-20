import { useFetch } from "@/hooks/useFetch.js";
import { getConcessions, adjustStock } from "@/api/concessionApi.js";
import { useState } from "react";
import "./Concessions.css";

export default function Concessions() {
    const { data: concessions, loading, error } = useFetch(getConcessions);
    const [message, setMessage] = useState(null);

    if (loading) return <p>Loading concessions...</p>;
    if (error) return <p>Error loading concessions</p>;

    const handleAdjust = async (id, delta) => {
        try {
            await adjustStock(id, delta);
            setMessage("Stock updated successfully");
        } catch (err) {
            setMessage("Failed to update stock");
        }
    };

    return (
        <div className="concessions-page">
            <h2>Concessions Management</h2>
            {message && <p>{message}</p>}
            <ul>
                {concessions.map((c) => (
                    <li key={c._id}>
                        {c.name} - Stock: {c.stock}
                        <button onClick={() => handleAdjust(c._id, 1)}>+1</button>
                        <button onClick={() => handleAdjust(c._id, -1)}>-1</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}