import { useParams, useNavigate } from "react-router-dom";
import { useFetch } from "@/hooks/useFetch.js";
import { getSeatMap, getShowtimeById, lockSeat, releaseLockSeat } from "@/api/showtimeApi.js";
import SeatMap from "@/components/SeatMap";
import { useEffect, useRef, useState } from "react";
import { calculatePrice } from "@/utils/calculatePrice.js";
import { useSharedSocket } from "@/context/SocketContext";
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

    const socket = useSharedSocket();
    const isNavigationRef = useRef(false);

    useEffect(() => {
        return () => {
            try {
                if (!isNavigationRef.current) {
                    const sessionId = localStorage.getItem("sessionId");
                    if (selected.length > 0 && sessionId) {
                        releaseLockSeat(showtimeId, selected, sessionId);
                    }
                }
            } catch (err) {
                console.error("Cleanup Failed: ", err);
            }
        };
    }, [selected, showtimeId]);

    useEffect(() => {
        if (!socket) return;

        socket.on("seatLocked", (seatKey) => {
            console.log("Seat Locked: ", seatKey);
            setSeatState((prev) => ({ ...prev, lockedSeats: Array.from(new Set([...prev.lockedSeats, seatKey])) }));
        });
        socket.on("seatUnlocked", (seatKey) => {
            console.log("Seat Unlocked: ", seatKey);
            setSeatState((prev) => ({ ...prev, lockedSeats: prev.lockedSeats.filter((s) => s !== seatKey) }));
        });
        socket.on("seatPending", (seatKey) => {
            console.log("Seat Pending: ", seatKey);
            setSeatState((prev) => ({ ...prev, lockedSeats: Array.from(new Set([...prev.lockedSeats, seatKey])) }));
        });
        socket.on("seatConfirmed", (seatKey) => {
            console.log("Seat Confirmed: ", seatKey);
            setSeatState((prev) => ({
                ...prev,
                bookedSeats: Array.form(new Set([...prev.bookedSeats, seatKey])),
                lockedSeats: prev.lockedSeats.filter((s) => s !== seatKey)
            }));
        });
        return () => {
            socket.off("seatLocked");
            socket.off("seatUnlocked");
            socket.off("seatPending");
            socket.off("seatConfirmed");
        };
    }, [socket]);

    if (loading || !showtime) return <p>Loading seats...</p>;
    if (error) return <p>Error loading seats.</p>;
    if (!seatMap) return <p>No seat map available.</p>;

    const handleSelect = async (seatKey) => {
        const sessionId = localStorage.getItem("sessionId");
        if (seatState?.lockedSeats?.includes(seatKey) || seatState?.bookedSeats?.includes(seatKey)) {
            alert("This seat is unavailable.");
            return;
        }
        if (selected.includes(seatKey)) {
            const newSelection = selected.filter((s) => s !== seatKey);
            setSelected(newSelection);
            if (sessionId) {
                await releaseLockSeat(showtimeId, [seatKey], sessionId);
            }
        } else {
            try {
                const newSelection = [...new Set([...selected, seatKey])];
                if (sessionId) {
                    const res = await lockSeat(showtimeId, newSelection, sessionId);
                    console.log("Lock response: ", res);
                    if (res?.status === 201) {
                        setSelected(newSelection);
                        console.log("Locked Seat is: ", newSelection);
                    } else {
                        console.warn("Unexpected lock reaponse: ", res);
                        alert("Unable to lock seat. Please try again!");
                    }
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
        const sessionId = localStorage.getItem("sessionId");
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
                sessionId
            }
        });
    };

    const clearSelection = () => {
        const sessionId = localStorage.getItem("sessionId");
        if (selected.length > 0 && sessionId) {
            releaseLockSeat(showtimeId, selected, sessionId);
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