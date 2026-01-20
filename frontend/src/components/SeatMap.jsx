import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket.js";
import "@/styles/seatMap.css";
import "@/styles/variables.css";

export default function SeatMap({ showtimeId, seats = [], rows, cols, onSelect, selected = [] }) {
    const [lockedSeats, setLockedSeats] = useState([]);
    const socket = useSocket("/showtimes");

    useEffect(() => {
        if (!socket) return;

        socket.emit("joinShowtime", { showtimeId });
        socket.on("seatLocked", (seatKey) =>
            setLockedSeats((prev) => (prev.includes(seatKey) ? prev : [...prev, seatKey]))
        );
        socket.on("seatUnlocked", (seatKey) =>
            setLockedSeats((prev) => prev.filter((s) => s !== seatKey))
        );

        return () => {
            socket.off("seatLocked");
            socket.off("seatUnlocked");
        };
    }, [socket, showtimeId]);

    const seatRows = [];
    for (let r = 0; r < rows; r++) {
        const rowLetter = String.fromCharCode(65 + r);
        const rowSeats = seats.filter((s) => s.row === rowLetter);
        seatRows.push({ rowLabel: rowLetter, seats: rowSeats });
    }

    console.log("SeatMap props: ", { showtimeId, rows, cols });

    if (!rows || !cols) return <p>No Seat Map Available.</p>;

    return (
        <div className="seatmap-container">
            <div className="screen">SCREEN</div>
            {seatRows.map(({ rowLabel, seats }) => (
                <div className="seat-row" key={rowLabel}>
                    <span className="row-label">{rowLabel}</span>
                    {seats.map((seat) => {
                        const seatKey = `${seat.row}${seat.col}`;
                        const isLocked = lockedSeats.includes(seatKey);
                        const isSelected = selected.includes(seatKey);
                        const isBooked = seat.booked;
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