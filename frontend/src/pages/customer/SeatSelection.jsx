import { useParams, useNavigate } from "react-router-dom";
import { useFetch } from "@/hooks/useFetch.js";
import { getSeatMap, lockSeat } from "@/api/showtimeApi.js";
import SeatMap from "@/components/SeatMap";
import { useState } from "react";
import "./SeatSelection.css";

export default function SeatSelection() {
    const { showtimeId } = useParams();
    const navigate = useNavigate();
    const { data: seatMap, loading, error } = useFetch(() => getSeatMap(showtimeId), null, [showtimeId]);
    const [selected, setSelected] = useState([]);

    if (loading) return <p>Loading seats...</p>;
    if (error) return <p>Error loading seats.</p>;
    if (!seatMap) return <p>No seat map available.</p>;

    console.log("Fetched seatMap: ", seatMap);

    const handleSelect = async (seatKey) => {
        if (selected.includes(seatKey)) {
            setSelected((prev) => prev.filter((s) => s !== seatKey));
        } else {
            try {
                await lockSeat(showtimeId, seatKey);
                setSelected((prev) => [...prev, seatKey]);
            } catch (err) {
                console.error("Failed to lock seat: ", err);
            }
        }
    };

    const sortedSeats = [...selected].sort((a, b) => {
        const [rowA, colA] = [a.charAt(0), parseInt(a.slice(1), 10)];
        const [rowB, colB] = [b.charAt(0), parseInt(b.slice(1), 10)];

        if (rowA === rowB) return colA - colB;
        return rowA.localeCompare(rowB);
    });

    const proceedCheckout = () => {
        navigate("/checkout", { state: { showtimeId, seats: sortedSeats } });
    };

    return (
        <div className="seat-page">
            <h2>Select Seats</h2>
            <SeatMap showtimeId={showtimeId} seats={seatMap.seats} rows={seatMap.rows} cols={seatMap.cols} onSelect={handleSelect} selected={selected} />
            <div className="selected-info">
                <p>Selected Seats :{selected.join(", ") || "None"}</p>
            </div>
            <button disabled={!selected.length} onClick={proceedCheckout}>
                Proceed to Checkout
            </button>
        </div>
    );
}