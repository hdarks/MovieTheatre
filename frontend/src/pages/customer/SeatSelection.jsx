import { useParams, useNavigate } from "react-router-dom";
import { useFetch } from "@/hooks/useFetch.js";
import { getSeatMap, lockSeat } from "@/api/showtimeApi.js";
import SeatMap from "@/components/SeatMap";
import { useState } from "react";
import { calculatePrice } from "@/utils/calculatePrice.js";
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
        if (seatMap.lockedSeats.includes(seatKey) || seatMap.bookedSeats.includes(seatKey)) {
            alert("This seat is unavailable.");
            return;
        }
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
        return rowA === rowB ? colA - colB : rowA.localeCompare(rowB);
    });

    const proceedCheckout = () => {
        navigate("/checkout", { state: { showtimeId, seats: sortedSeats } });
    };

    const clearSelection = () => setSelected([]);

    return (
        <div className="seat-page">
            <h2>Select Seats</h2>

            <div className="seat-legend">
                <span><span className="legend-box standard"> Standard</span></span>
                <span><span className="legend-box vip"> VIP</span></span>
                <span><span className="legend-box accessible"> Accessible</span></span>
                <span><span className="legend-box Booked"> Booked</span></span>
                <span><span className="legend-box locked"> Locked</span></span>
                <span><span className="legend-box selected"> Selected</span></span>
            </div>

            <SeatMap
                showtimeId={showtimeId}
                seats={seatMap.seats}
                ows={seatMap.rows}
                cols={seatMap.cols}
                lockedSeats={seatMap.lockedSeats}
                bookedSeats={seatMap.bookedSeats}
                onSelect={handleSelect}
                selected={selected}
            />
            <div className="selected-info">
                <p>Selected Seats :{selected.join(", ") || "None"}</p>
                {seatMap.basePrice && selected.length > 0 && (
                    <p>
                        Total Price: ₹
                        {selected.reduce((sum, seatKey) => sum + calculatePrice(seatMap.basePrice, seatMap.pricingRules), 0)}
                    </p>
                )}
            </div>
            <div className="actions">
                <button className="btn btn-secondary" onClick={clearSelection} disabled={!selected.length}>
                    Clear Selection
                </button>
                <button disabled={!selected.length} onClick={proceedCheckout}>
                    Proceed to Checkout
                </button>
            </div>
        </div>
    );
}