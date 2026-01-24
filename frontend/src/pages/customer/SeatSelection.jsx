import { useParams, useNavigate } from "react-router-dom";
import { useFetch } from "@/hooks/useFetch.js";
import { getSeatMap, getShowtimeById, lockSeat, releaseLockSeat } from "@/api/showtimeApi.js";
import SeatMap from "@/components/SeatMap";
import { useEffect, useState } from "react";
import { calculatePrice } from "@/utils/calculatePrice.js";
import { useSocket } from "@/hooks/useSocket.js";
import "./SeatSelection.css";
import "@/styles/variables.css";
import "@/styles/seatMap.css";

export default function SeatSelection() {
    const { showtimeId } = useParams();
    const navigate = useNavigate();
    const { data: seatMap, loading, error } = useFetch(() => getSeatMap(showtimeId), null, [showtimeId]);
    const { data: showtime } = useFetch(() => getShowtimeById(showtimeId), null, [showtimeId]);
    const [selected, setSelected] = useState([]);
    const [seatState, setSeatState] = useState(seatMap);

    const socket = useSocket("/showtimes");

    useEffect(() => {
        return () => {
            try {
                if (selected.length > 0 && socket?.id) {
                    releaseLockSeat(showtimeId, selected, socket.id);
                }
            } catch (err) {
                console.error("Cleanup Failed: ", err);
            }
        };
    }, [selected, showtimeId, socket?.id]);

    useEffect(() => {
        if (!socket) return;
        socket.on("seatPending", (seatKey) => {
            console.log("Seat Pending: ", seatKey);
            setSeatState((prev) => ({ ...prev, lockedSeats: [...prev.lockedSeats, seatKey] }));
        });
        socket.on("seatConfirmed", (seatKey) => {
            console.log("Seat Confirmed: ", seatKey);
            setSeatState((prev) => ({
                ...prev,
                bookedSeats: [...prev.bookedSeats, seatKey],
                lockedSeats: prev.lockedSeats.filter((s) => s !== seatKey)
            }));
        });
        return () => {
            socket.off("seatPending");
            socket.off("seatConfirmed");
        };
    }, [socket]);

    if (loading || !showtime) return <p>Loading seats...</p>;
    if (error) return <p>Error loading seats.</p>;
    if (!seatMap) return <p>No seat map available.</p>;

    const handleSelect = async (seatKey) => {
        if (seatState?.lockedSeats?.includes(seatKey) || seatState?.bookedSeats?.includes(seatKey)) {
            alert("This seat is unavailable.");
            return;
        }
        if (selected.includes(seatKey)) {
            setSelected((prev) => prev.filter((s) => s !== seatKey));
            if (socket?.id) {
                await releaseLockSeat(showtimeId, [seatKey], socket.id);
            }
        } else {
            try {
                if (socket?.id) {
                    await lockSeat(showtimeId, [seatKey], socket.id);
                    setSelected((prev) => [...prev, seatKey]);
                }
            } catch (err) {
                console.error("Failed to lock seat.", err);
                alert("Unable to lock seat. Please try again!");
            }
        }
    };

    const sortedSeats = [...selected].sort((a, b) => {
        const [rowA, colA] = [a.charAt(0), parseInt(a.slice(1), 10)];
        const [rowB, colB] = [b.charAt(0), parseInt(b.slice(1), 10)];
        return rowA === rowB ? colA - colB : rowA.localeCompare(rowB);
    });

    const proceedCheckout = () => {
        navigate("/checkout", {
            state: {
                showtimeId,
                seats: sortedSeats.map((seatKey) => ({
                    seatKey,
                    pricePaid: calculatePrice(Number(seatMap.basePrice), seatMap.pricingRules)
                })),
                basePrice: seatMap.basePrice,
                pricingRules: seatMap.pricingRules,
                showtime,
                sessionId: socket?.id
            }
        });
    };

    const clearSelection = () => {
        if (selected.length > 0) {
            releaseLockSeat(showtimeId, selected, socket.id);
        }
        setSelected([]);
    };

    return (
        <div className="seat-page">
            <h2>Select Seats</h2>

            <div className="seat-legend">
                <div className="legend-item">
                    <span className="legend-circle standard"></span> Standard
                </div>
                <div className="legend-item">
                    <span className="legend-circle vip"></span> VIP
                </div>
                <div className="legend-item">
                    <span className="legend-circle accessible"></span> Accessible
                </div>
                <div className="legend-item">
                    <span className="legend-circle Booked"></span> Booked
                </div>
                <div className="legend-item">
                    <span className="legend-circle locked"></span> Locked
                </div>
                <div className="legend-item">
                    <span className="legend-circle selected"></span> Selected
                </div>
            </div>

            <SeatMap
                showtimeId={showtimeId}
                seats={seatMap.seats}
                rows={seatMap.rows}
                cols={seatMap.cols}
                lockedSeats={seatMap.lockedSeats}
                bookedSeats={seatMap.bookedSeats}
                onSelect={handleSelect}
                selected={selected}
                socket={socket}
            />
            <div className="selected-info">
                <p>Selected Seats :{selected.join(", ") || "None"}</p>
                {seatMap.basePrice && selected.length > 0 && (
                    <p>
                        Total Price: ₹
                        {selected.reduce((sum, seatKey) => sum + calculatePrice(Number(seatMap.basePrice || 0), seatMap.pricingRules || []), 0)}
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