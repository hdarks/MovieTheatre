import { useEffect, useState } from "react";
import "@/styles/seatMap.css";
import "@/styles/variables.css";
import "./SeatMap.css";

export default function SeatMap({
    showtimeId, seats = [], rows, cols, lockedSeats = [],
    bookedSeats = [], onSelect, selected = [], socket
}) {
    const [liveLockedSeats, setLiveLockedSeats] = useState(lockedSeats);
    const [liveBookedSeats, setLiveBookedSeats] = useState(bookedSeats);

    useEffect(() => {
        if (!socket) return;

        socket.emit("joinShowtime", { showtimeId });
        socket.on("seatLocked", (seatKey) =>
            setLiveLockedSeats((prev) => (prev.includes(seatKey) ? prev : [...prev, seatKey]))
        );
        socket.on("seatUnlocked", (seatKey) =>
            setLiveLockedSeats((prev) => prev.filter((s) => s !== seatKey))
        );
        socket.on("seatBooked", (seatKey) => {
            setLiveLockedSeats((prev) => prev.filter((s) => s !== seatKey));
            setLiveBookedSeats((prev) => (prev.includes(seatKey) ? prev : [...prev, seatKey]));
        });
        socket.on("seatCancelled", (seatKey) => {
            setLiveBookedSeats((prev) => prev.filter((s) => s !== seatKey));
        })
        return () => {
            socket.off("seatLocked");
            socket.off("seatUnlocked");
            socket.off("seatBooked");
            socket.off("seatCancelled");
        };
    }, [socket, showtimeId]);

    const seatRows = [];
    for (let r = 0; r < rows; r++) {
        const rowLetter = String.fromCharCode(65 + r);
        const rowSeats = seats.filter((s) => s.row === rowLetter);
        seatRows.push({ rowLabel: rowLetter, seats: rowSeats });
    }

    if (!rows || !cols) return <p>No Seat Map Available.</p>;

    return (
        <div className="seatmap-container">
            <div className="screen">SCREEN</div>
            {seatRows.map(({ rowLabel, seats }) => (
                <div className="seat-row" key={rowLabel}>
                    <span className="row-label">{rowLabel}</span>
                    {seats.map((seat) => {
                        const seatKey = `${seat.row}${seat.col}`;
                        const isLocked = liveLockedSeats.includes(seatKey);
                        const isSelected = selected.includes(seatKey);
                        const isBooked = liveBookedSeats.includes(seatKey);
                        return (
                            <button key={seatKey} disabled={isLocked || isBooked}
                                className={`seat 
                                ${isBooked ? "booked" : isLocked ? "locked" : "available"}
                                ${isSelected ? "selected" : ""}
                                ${seat.type}`}
                                onClick={() => {
                                    if (isSelected) {
                                        socket.emit("unlockSeat", { showtimeId, seatKey });
                                    } else {
                                        socket.emit("lockSeat", { showtimeId, seatKey });
                                    }
                                    onSelect(seatKey);
                                }}>
                                {seatKey}
                            </button>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}