import { useLocation, useNavigate } from "react-router-dom";
import { createBooking } from "@/api/bookingApi.js";
import { releaseLockSeat } from "@/api/showtimeApi.js";
import { v4 as uuidv4 } from "uuid";
import { useSharedSocket } from "@/context/SocketContext";
import { useEffect, useRef } from "react";
import "./Checkout.css";

export default function Checkout() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const socket = useSharedSocket();
    const releasedRef = useRef(false);
    const getSessionId = () => socket?.id || localStorage.getItem("sessionId");

    const handleConfirm = async () => {
        try {
            const sessionId = getSessionId();
            console.log("Booking Payload: ", {
                showtimeId: state?.showtimeId,
                seats: state?.seats,
                sessionId
            });
            const res = await createBooking({
                showtimeId: state?.showtimeId,
                seats: state?.seats || [],
                sessionId,
                payment: {
                    provider: "mock",
                    intentId: uuidv4(),
                    amount: state.seats.reduce((sum, s) => sum + s.pricePaid, 0),
                    currency: "INR",
                    captured: false
                }
            });
            navigate("/tickets", { state: { bookingId: res.data._id } });
        } catch (err) {
            console.error("Booking failed:", err);
            const sessionId = getSessionId();
            if (sessionId && state?.seats?.length && !releasedRef.current) {
                await releaseLockSeat(state.showtimeId, state.seats, sessionId);
                releasedRef.current = true;
            }
        }
    };

    useEffect(() => {
        return () => {
            const sessionId = getSessionId();
            if (sessionId && state?.seats?.length && !releasedRef.current) {
                releaseLockSeat(state.showtimeId, state.seats, sessionId);
                releasedRef.current = true;
            }
        };
    }, [state]);

    if (!state) return <p>No checkout data provided.</p>;

    return (
        <div className="checkout-page">
            <h2>Checkout</h2>
            {state.showtime ? (
                <>
                    <div className="checkout-details">
                        <p><strong>Movie:</strong> {state.showtime.movieId.title}</p>
                        <p><strong>Showtime:</strong> {new Date(state.showtime.startTime).toLocaleDateString()}</p>
                        {state.showtime.theatreId && (
                            <p><strong>Theatre: </strong>{state.showtime.theatreId.name}</p>
                        )}
                    </div>
                </>
            ) : (
                <p><strong>Showtime ID:</strong> {state.showtimeId}</p>
            )}
            {state.seats?.length ? (
                <div className="checkout-seats">
                    <p><strong>Seats:</strong></p>
                    <ul>
                        {state.seats.map((s, i) => (
                            <li key={i}>
                                {s.seatKey} - ₹{s.pricePaid}
                            </li>
                        ))}
                    </ul>
                    <p><strong>Total Price: </strong>₹{state.seats.reduce((sum, s) => sum + s.pricePaid, 0)}</p>
                </div>
            ) : (
                <p>No Seats selected.</p>
            )}
            <button onClick={handleConfirm}>Confirm Booking</button>
        </div>
    );
}