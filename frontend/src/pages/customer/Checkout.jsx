import { useLocation, useNavigate } from "react-router-dom";
import { createBooking } from "@/api/bookingApi.js";
import { v4 as uuidv4 } from "uuid";
import "./Checkout.css";

export default function Checkout() {
    const { state } = useLocation();
    const navigate = useNavigate();

    const handleConfirm = async () => {
        try {
            console.log("Booking Payload: ", {
                showtimeId: state?.showtimeId,
                seats: state?.seats,
                sessionId: state?.sessionId
            });
            const res = await createBooking({
                showtimeId: state?.showtimeId,
                seats: state?.seats || [],
                sessionId: state?.sessionId,
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
        }
    };

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